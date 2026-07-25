package com.firstshield

import android.app.AppOpsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.firstshield.data.Prefs
import com.firstshield.scanner.AppScanner
import com.firstshield.scanner.PrivacyRating
import com.firstshield.services.FirstShieldMainService
import com.google.android.material.switchmaterial.SwitchMaterial

class MainActivity : AppCompatActivity() {

    private lateinit var switchMaster: SwitchMaterial
    private lateinit var tvStatus: TextView
    private lateinit var tvScanResult: TextView
    private lateinit var btnScanApps: Button
    private lateinit var btnRequestOverlay: Button
    private lateinit var btnRequestUsageAccess: Button
    private lateinit var containerPermWarnings: LinearLayout

    private val stateReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            val enabled = intent.getBooleanExtra("enabled", true)
            updateToggleUI(enabled)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Prefs.init(this)
        setContentView(R.layout.activity_main)

        switchMaster         = findViewById(R.id.switchMaster)
        tvStatus             = findViewById(R.id.tvStatus)
        tvScanResult         = findViewById(R.id.tvScanResult)
        btnScanApps          = findViewById(R.id.btnScanApps)
        btnRequestOverlay    = findViewById(R.id.btnRequestOverlay)
        btnRequestUsageAccess= findViewById(R.id.btnRequestUsageAccess)
        containerPermWarnings= findViewById(R.id.containerPermWarnings)

        // Master toggle
        switchMaster.isChecked = Prefs.isEnabled
        updateToggleUI(Prefs.isEnabled)

        switchMaster.setOnCheckedChangeListener { _, checked ->
            val action = if (checked) FirstShieldMainService.ACTION_ENABLE
                         else FirstShieldMainService.ACTION_DISABLE
            startService(Intent(this, FirstShieldMainService::class.java).apply { this.action = action })
            updateToggleUI(checked)
        }

        // Scan button — runs local scan
        btnScanApps.setOnClickListener {
            tvScanResult.text = "Scanning installed apps...\n(This may take a moment)"
            btnScanApps.isEnabled = false

            Thread {
                val results = AppScanner.scanAllUserApps(this)
                val redApps    = results.filter { it.privacyRating == PrivacyRating.RED }
                val yellowApps = results.filter { it.privacyRating == PrivacyRating.YELLOW }
                val greenApps  = results.filter { it.privacyRating == PrivacyRating.GREEN }

                val sb = StringBuilder()
                sb.appendLine("✅ Scan complete — ${results.size} apps checked\n")
                if (redApps.isNotEmpty()) {
                    sb.appendLine("🔴 HIGH RISK (${redApps.size} apps):")
                    redApps.take(5).forEach { sb.appendLine("  • ${it.appName} — ${it.dangerousPermissions.size} risky perms, ${it.trackers.size} trackers") }
                    sb.appendLine()
                }
                if (yellowApps.isNotEmpty()) {
                    sb.appendLine("🟡 MEDIUM RISK (${yellowApps.size} apps):")
                    yellowApps.take(5).forEach { sb.appendLine("  • ${it.appName}") }
                    sb.appendLine()
                }
                sb.appendLine("🟢 LOW RISK: ${greenApps.size} apps look safe.")

                runOnUiThread {
                    tvScanResult.text = sb.toString()
                    btnScanApps.isEnabled = true
                }
            }.start()
        }

        // Request overlay permission
        btnRequestOverlay.setOnClickListener {
            startActivity(
                Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:$packageName"))
            )
        }

        // Request usage access permission
        btnRequestUsageAccess.setOnClickListener {
            startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
        }

        // Register broadcast to receive toggle state changes
        registerReceiver(stateReceiver, IntentFilter("com.firstshield.STATE_CHANGED"))

        // Start main service if not running
        startForegroundService(Intent(this, FirstShieldMainService::class.java))

        // Check what permissions are missing
        refreshPermissionWarnings()
    }

    private fun updateToggleUI(enabled: Boolean) {
        switchMaster.isChecked = enabled
        if (enabled) {
            tvStatus.text = "🛡 FirstShield is ACTIVE\nAll monitoring is running locally on your device."
            tvStatus.setBackgroundResource(R.drawable.bg_status_active)
        } else {
            tvStatus.text = "⏸ FirstShield is PAUSED\nAll pop-ups and alerts are temporarily disabled."
            tvStatus.setBackgroundResource(R.drawable.bg_status_paused)
        }
    }

    private fun refreshPermissionWarnings() {
        containerPermWarnings.removeAllViews()

        if (!Settings.canDrawOverlays(this)) {
            addWarning("⚠ Overlay Permission Missing — Tap to grant it so pop-ups can appear", btnRequestOverlay)
        }
        if (!hasUsageStatsPermission()) {
            addWarning("⚠ Usage Access Missing — Tap to grant it for screen-time tracking", btnRequestUsageAccess)
        }
    }

    private fun addWarning(msg: String, actionBtn: Button) {
        val tv = TextView(this).apply {
            text = msg
            textSize = 12f
            setPadding(24, 16, 24, 16)
            setTextColor(0xFF8B3A00.toInt())
            setBackgroundResource(R.drawable.bg_warning)
        }
        containerPermWarnings.addView(tv)
        actionBtn.visibility = android.view.View.VISIBLE
    }

    private fun hasUsageStatsPermission(): Boolean {
        val appOps = getSystemService(APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    override fun onResume() {
        super.onResume()
        refreshPermissionWarnings()
    }

    override fun onDestroy() {
        try { unregisterReceiver(stateReceiver) } catch (e: Exception) { }
        super.onDestroy()
    }
}
