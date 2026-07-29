package com.firstshield

import android.app.AlertDialog
import android.app.AppOpsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.firstshield.data.Prefs
import com.firstshield.scanner.AppScanner
import com.firstshield.scanner.PrivacyRating
import com.firstshield.services.FirstShieldMainService
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.RequestConfiguration
import com.google.android.material.switchmaterial.SwitchMaterial

class MainActivity : AppCompatActivity() {

    private lateinit var switchMaster: SwitchMaterial
    private lateinit var tvStatus: TextView
    private lateinit var tvScanResult: TextView
    private lateinit var btnScanApps: Button
    private lateinit var btnRequestOverlay: Button
    private lateinit var btnRequestUsageAccess: Button
    private lateinit var containerPermWarnings: LinearLayout
    private lateinit var btnPrivateDns: Button
    private lateinit var btnYouTubeRestricted: Button
    private lateinit var btnPlayProtect: Button
    private lateinit var btnHelpline: Button
    private lateinit var btnEmergencySOS: Button
    private lateinit var btnBatterySettings: Button

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

        // ── AdMob — G-rated family-safe content filter ──────────────────────
        // Must be set BEFORE MobileAds.initialize so every ad request
        // is filtered to G-rated (child-appropriate) content only.
        val requestConfiguration = RequestConfiguration.Builder()
            .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G)
            .build()
        MobileAds.setRequestConfiguration(requestConfiguration)
        MobileAds.initialize(this)
        // ────────────────────────────────────────────────────────────────────

        switchMaster          = findViewById(R.id.switchMaster)
        tvStatus              = findViewById(R.id.tvStatus)
        tvScanResult          = findViewById(R.id.tvScanResult)
        btnScanApps           = findViewById(R.id.btnScanApps)
        btnRequestOverlay     = findViewById(R.id.btnRequestOverlay)
        btnRequestUsageAccess = findViewById(R.id.btnRequestUsageAccess)
        containerPermWarnings = findViewById(R.id.containerPermWarnings)
        btnPrivateDns         = findViewById(R.id.btnPrivateDns)
        btnYouTubeRestricted  = findViewById(R.id.btnYouTubeRestricted)
        btnPlayProtect        = findViewById(R.id.btnPlayProtect)
        btnHelpline           = findViewById(R.id.btnHelpline)
        btnEmergencySOS       = findViewById(R.id.btnEmergencySOS)
        btnBatterySettings    = findViewById(R.id.btnBatterySettings)

        // ── Master toggle ────────────────────────────────────────────────────
        switchMaster.isChecked = Prefs.isEnabled
        updateToggleUI(Prefs.isEnabled)

        switchMaster.setOnCheckedChangeListener { _, checked ->
            val action = if (checked) FirstShieldMainService.ACTION_ENABLE
                         else FirstShieldMainService.ACTION_DISABLE
            startService(Intent(this, FirstShieldMainService::class.java).apply { this.action = action })
            updateToggleUI(checked)
        }

        // ── App Scanner ──────────────────────────────────────────────────────
        btnScanApps.setOnClickListener {
            tvScanResult.text = "Scanning installed apps…\n(This may take a moment)"
            btnScanApps.isEnabled = false

            Thread {
                val results   = AppScanner.scanAllUserApps(this)
                val redApps   = results.filter { it.privacyRating == PrivacyRating.RED }
                val yellowApps= results.filter { it.privacyRating == PrivacyRating.YELLOW }
                val greenApps = results.filter { it.privacyRating == PrivacyRating.GREEN }

                val sb = StringBuilder()
                sb.appendLine("✅ Scan complete — ${results.size} apps checked\n")
                if (redApps.isNotEmpty()) {
                    sb.appendLine("🔴 HIGH RISK (${redApps.size} apps):")
                    redApps.take(5).forEach {
                        sb.appendLine("  • ${it.appName} — ${it.dangerousPermissions.size} risky perms, ${it.trackers.size} trackers")
                    }
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

        // ── Private DNS ──────────────────────────────────────────────────────
        // Opens the system Private DNS screen (API 29+) where the user types
        // "family.adguard-dns.com" to block adult content at the DNS level.
        btnPrivateDns.setOnClickListener {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    startActivity(Intent(Settings.ACTION_PRIVATE_DNS_SETTINGS))
                } else {
                    startActivity(Intent(Settings.ACTION_WIRELESS_SETTINGS))
                }
            } catch (e: Exception) {
                startActivity(Intent(Settings.ACTION_SETTINGS))
            }
        }

        // ── YouTube Restricted Mode ──────────────────────────────────────────
        // Launches the YouTube app (or browser fallback) so parents can enable
        // Restricted Mode: Account → Settings → Restricted Mode.
        btnYouTubeRestricted.setOnClickListener {
            val youtubeApp = packageManager.getLaunchIntentForPackage("com.google.android.youtube")
            if (youtubeApp != null) {
                startActivity(youtubeApp)
                Toast.makeText(
                    this,
                    "In YouTube: tap your profile → Settings → Restricted Mode → ON",
                    Toast.LENGTH_LONG
                ).show()
            } else {
                startActivity(
                    Intent(Intent.ACTION_VIEW,
                        Uri.parse("https://support.google.com/youtube/answer/174084"))
                )
            }
        }

        // ── Google Play Protect ──────────────────────────────────────────────
        // Opens the Play Store's Play Protect section so the user can run a
        // full malware scan from Google's own security scanner.
        btnPlayProtect.setOnClickListener {
            try {
                // Direct deep-link to Play Protect inside the Play Store
                val intent = Intent(Intent.ACTION_VIEW,
                    Uri.parse("market://details?id=com.google.android.gms")).apply {
                    setPackage("com.android.vending")
                }
                startActivity(intent)
                Toast.makeText(
                    this,
                    "In Play Store: tap Menu (☰) → Play Protect → Scan",
                    Toast.LENGTH_LONG
                ).show()
            } catch (e: Exception) {
                // Fallback: device security settings (Play Protect visible there too)
                try {
                    startActivity(Intent(Settings.ACTION_SECURITY_SETTINGS))
                } catch (ex: Exception) {
                    startActivity(Intent(Intent.ACTION_VIEW,
                        Uri.parse("https://support.google.com/googleplay/answer/2812853")))
                }
            }
        }

        // ── Cyber Crime Helpline ─────────────────────────────────────────────
        // Dials India's National Cyber Crime Helpline 1930.
        // Uses ACTION_DIAL so the user confirms before calling.
        btnHelpline.setOnClickListener {
            startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:1930")))
        }

        // ── Emergency SOS ────────────────────────────────────────────────────
        // Shows a dialog so the user can choose 112 (National Emergency)
        // or 1098 (Childline). ACTION_DIAL lets them confirm before calling.
        btnEmergencySOS.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("📞  Call Emergency Helpline")
                .setMessage("Choose the helpline to call:")
                .setPositiveButton("🚑  112 — National Emergency") { _, _ ->
                    startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:112")))
                }
                .setNegativeButton("👧  1098 — Childline") { _, _ ->
                    startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:1098")))
                }
                .setNeutralButton("Cancel", null)
                .show()
        }

        // ── Battery & Device Health ──────────────────────────────────────────
        // Opens the system Battery Saver settings page where users can check
        // battery health and configure overheating / saver thresholds.
        btnBatterySettings.setOnClickListener {
            try {
                startActivity(Intent(Settings.ACTION_BATTERY_SAVER_SETTINGS))
            } catch (ex: Exception) {
                // Fallback: open general device settings if ACTION_BATTERY_SAVER_SETTINGS
                // is not available on this ROM (some OEMs remove it).
                startActivity(Intent(Settings.ACTION_SETTINGS))
            }
        }

        // ── Overlay / Usage access permission buttons ────────────────────────
        btnRequestOverlay.setOnClickListener {
            startActivity(
                Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:$packageName"))
            )
        }
        btnRequestUsageAccess.setOnClickListener {
            startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
        }

        // Broadcast for toggle state changes from notification action
        registerReceiver(stateReceiver, IntentFilter("com.firstshield.STATE_CHANGED"))

        // Ensure the main service is running
        startForegroundService(Intent(this, FirstShieldMainService::class.java))
        refreshPermissionWarnings()
    }

    private fun updateToggleUI(enabled: Boolean) {
        switchMaster.isChecked = enabled
        if (enabled) {
            tvStatus.text = "🛡 FirstShield is ACTIVE — All monitoring running locally."
            tvStatus.setBackgroundResource(R.drawable.bg_status_active)
        } else {
            tvStatus.text = "⏸ FirstShield is PAUSED — All pop-ups and alerts disabled."
            tvStatus.setBackgroundResource(R.drawable.bg_status_paused)
        }
    }

    private fun refreshPermissionWarnings() {
        containerPermWarnings.removeAllViews()
        if (!Settings.canDrawOverlays(this)) {
            addWarning("⚠ Overlay Permission Missing — Tap to grant", btnRequestOverlay)
        }
        if (!hasUsageStatsPermission()) {
            addWarning("⚠ Usage Access Missing — Tap to grant for screen-time tracking", btnRequestUsageAccess)
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
