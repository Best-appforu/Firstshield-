package com.firstshield

import android.app.AppOpsManager
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.view.View
import android.view.animation.AnimationUtils
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.firstshield.data.Prefs
import android.Manifest

/**
 * First-launch Setup Wizard.
 * Step 0 — Welcome
 * Step 1 — Overlay permission      (SYSTEM_ALERT_WINDOW)
 * Step 2 — Usage access            (PACKAGE_USAGE_STATS)
 * Step 3 — Notifications           (POST_NOTIFICATIONS, Android 13+)
 * Step 4 — Battery optimization    (REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
 * Step 5 — All done!
 *
 * Shown only on first launch. Prefs.setupComplete gates it.
 */
class SetupWizardActivity : AppCompatActivity() {

    private var currentStep = 0
    private val totalSteps  = 6  // steps 0..5

    // Step panels
    private lateinit var panelWelcome: View
    private lateinit var panelOverlay: View
    private lateinit var panelUsage:   View
    private lateinit var panelNotif:   View
    private lateinit var panelBattery: View
    private lateinit var panelDone:    View

    // Step indicator dots
    private lateinit var dots: Array<View>

    // Bottom nav
    private lateinit var btnNext: Button
    private lateinit var btnSkip: TextView

    // Status TextViews
    private lateinit var tvOverlayStatus:  TextView
    private lateinit var tvUsageStatus:    TextView
    private lateinit var tvNotifStatus:    TextView
    private lateinit var tvBatteryStatus:  TextView

    // Grant buttons
    private lateinit var btnGrantOverlay:  Button
    private lateinit var btnGrantUsage:    Button
    private lateinit var btnGrantNotif:    Button
    private lateinit var btnGrantBattery:  Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Prefs.init(this)

        if (Prefs.setupComplete) { launchMain(); return }

        setContentView(R.layout.activity_setup_wizard)

        // Panels
        panelWelcome = findViewById(R.id.panelWelcome)
        panelOverlay = findViewById(R.id.panelOverlay)
        panelUsage   = findViewById(R.id.panelUsage)
        panelNotif   = findViewById(R.id.panelNotif)
        panelBattery = findViewById(R.id.panelBattery)
        panelDone    = findViewById(R.id.panelDone)

        // Dots (6 total, one per step)
        dots = arrayOf(
            findViewById(R.id.dot0), findViewById(R.id.dot1),
            findViewById(R.id.dot2), findViewById(R.id.dot3),
            findViewById(R.id.dot4), findViewById(R.id.dot5)
        )

        btnNext = findViewById(R.id.btnNext)
        btnSkip = findViewById(R.id.tvSkip)

        // Status labels
        tvOverlayStatus = findViewById(R.id.tvOverlayStatus)
        tvUsageStatus   = findViewById(R.id.tvUsageStatus)
        tvNotifStatus   = findViewById(R.id.tvNotifStatus)
        tvBatteryStatus = findViewById(R.id.tvBatteryStatus)

        // Grant buttons
        btnGrantOverlay = findViewById(R.id.btnGrantOverlay)
        btnGrantUsage   = findViewById(R.id.btnGrantUsage)
        btnGrantNotif   = findViewById(R.id.btnGrantNotif)
        btnGrantBattery = findViewById(R.id.btnGrantBattery)

        // Wire up clicks
        findViewById<Button>(R.id.btnWelcomeStart).setOnClickListener { goNext() }
        btnGrantOverlay.setOnClickListener { openOverlaySettings() }
        btnGrantUsage.setOnClickListener   { openUsageSettings() }
        btnGrantNotif.setOnClickListener   { requestNotifPermission() }
        btnGrantBattery.setOnClickListener { requestBatteryExemption() }
        btnNext.setOnClickListener         { goNext() }
        btnSkip.setOnClickListener         { skipToEnd() }
        findViewById<Button>(R.id.btnStartShield).setOnClickListener { finishSetup() }

        showStep(0)
    }

    private fun goNext() {
        val next = currentStep + 1
        if (next >= totalSteps) finishSetup() else showStep(next)
    }

    private fun skipToEnd() = showStep(5)

    private fun showStep(step: Int) {
        currentStep = step

        val fadeIn = AnimationUtils.loadAnimation(this, android.R.anim.fade_in).apply { duration = 280 }

        panelWelcome.visibility = if (step == 0) View.VISIBLE else View.GONE
        panelOverlay.visibility = if (step == 1) View.VISIBLE else View.GONE
        panelUsage.visibility   = if (step == 2) View.VISIBLE else View.GONE
        panelNotif.visibility   = if (step == 3) View.VISIBLE else View.GONE
        panelBattery.visibility = if (step == 4) View.VISIBLE else View.GONE
        panelDone.visibility    = if (step == 5) View.VISIBLE else View.GONE

        currentPanel()?.startAnimation(fadeIn)

        dots.forEachIndexed { i, dot ->
            dot.setBackgroundResource(if (i == step) R.drawable.dot_active else R.drawable.dot_inactive)
        }

        when (step) {
            0, 5 -> {
                btnNext.visibility = View.GONE
                btnSkip.visibility = View.GONE
            }
            else -> {
                btnNext.visibility = View.VISIBLE
                btnSkip.visibility = View.VISIBLE
                btnNext.text = if (step == 4) "Finish →" else "Next →"
            }
        }

        when (step) {
            1 -> refreshOverlayStatus()
            2 -> refreshUsageStatus()
            3 -> refreshNotifStatus()
            4 -> refreshBatteryStatus()
            5 -> populateDoneSummary()
        }
    }

    private fun currentPanel(): View? = when (currentStep) {
        0 -> panelWelcome; 1 -> panelOverlay; 2 -> panelUsage
        3 -> panelNotif;   4 -> panelBattery; 5 -> panelDone
        else -> null
    }

    // ── 1. Overlay ────────────────────────────────────────────────────────────

    private fun openOverlaySettings() = startActivity(
        Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName"))
    )

    private fun refreshOverlayStatus() =
        applyStatus(tvOverlayStatus, btnGrantOverlay, Settings.canDrawOverlays(this))

    // ── 2. Usage access ───────────────────────────────────────────────────────

    private fun openUsageSettings() = startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))

    private fun refreshUsageStatus() = applyStatus(tvUsageStatus, btnGrantUsage, hasUsageStats())

    private fun hasUsageStats(): Boolean {
        val appOps = getSystemService(APP_OPS_SERVICE) as AppOpsManager
        return appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), packageName
        ) == AppOpsManager.MODE_ALLOWED
    }

    // ── 3. Notifications (Android 13+) ────────────────────────────────────────

    private fun requestNotifPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 100)
        }
    }

    private fun refreshNotifStatus() {
        val granted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                android.content.pm.PackageManager.PERMISSION_GRANTED
        else true

        applyStatus(tvNotifStatus, btnGrantNotif, granted)

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            panelNotif.findViewById<TextView>(R.id.tvNotifNote).text =
                "Your Android version grants notification access automatically. ✓"
            btnGrantNotif.isEnabled = false
        }
    }

    // ── 4. Battery optimization exemption ─────────────────────────────────────

    /**
     * Fires the user's exact code snippet:
     *   intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
     *   intent.setData(Uri.parse("package:" + getPackageName()))
     *   startActivity(intent)
     *
     * This sends Android's built-in "Allow unrestricted battery use?" dialog
     * directly — no custom UI required.
     */
    private fun requestBatteryExemption() {
        val intent = Intent()
        intent.action = Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
        intent.data   = Uri.parse("package:$packageName")
        startActivity(intent)
    }

    private fun refreshBatteryStatus() {
        val ignored = isBatteryOptimizationIgnored()
        applyStatus(tvBatteryStatus, btnGrantBattery, ignored)

        // If already exempted, update the description text
        if (ignored) {
            panelBattery.findViewById<TextView>(R.id.tvBatteryDesc)?.text =
                "Great! Android won't kill FirstShield in the background. All features will work reliably."
        }
    }

    private fun isBatteryOptimizationIgnored(): Boolean {
        val pm = getSystemService(POWER_SERVICE) as PowerManager
        return pm.isIgnoringBatteryOptimizations(packageName)
    }

    // ── 5. Done summary ───────────────────────────────────────────────────────

    private fun populateDoneSummary() {
        val overlay  = Settings.canDrawOverlays(this)
        val usage    = hasUsageStats()
        val notif    = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                android.content.pm.PackageManager.PERMISSION_GRANTED
            else true
        val battery  = isBatteryOptimizationIgnored()

        val tvSummary = findViewById<TextView>(R.id.tvDoneSummary)
        val sb = StringBuilder()
        sb.appendLine(if (overlay)  "✅  Pop-up overlays — working"                    else "⚠️  Pop-up overlays — not granted (alerts won't show)")
        sb.appendLine(if (usage)    "✅  Screen time tracking — working"               else "⚠️  Screen time — not granted (screen-time alerts disabled)")
        sb.appendLine(if (notif)    "✅  Notifications — working"                      else "⚠️  Notifications — not granted (status bar badge won't show)")
        sb.appendLine(if (battery)  "✅  Always-on background — working"               else "⚠️  Battery optimization — not exempt (Android may pause services)")
        sb.appendLine()
        sb.append("You can grant any missing permissions from the main screen later.")
        tvSummary.text = sb.toString().trim()
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun applyStatus(tv: TextView, btn: Button, granted: Boolean) {
        if (granted) {
            tv.text = "✅ Granted"
            tv.setTextColor(0xFF2E7D52.toInt())
            btn.text = "Granted ✓"
            btn.isEnabled = false
            btn.alpha = 0.6f
        } else {
            tv.text = "⚠ Not yet granted"
            tv.setTextColor(0xFF8B3A00.toInt())
            btn.text = "Grant Permission →"
            btn.isEnabled = true
            btn.alpha = 1.0f
        }
    }

    private fun finishSetup() { Prefs.setupComplete = true; launchMain() }

    private fun launchMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    // Re-check when user returns from a Settings screen
    override fun onResume() {
        super.onResume()
        when (currentStep) {
            1 -> refreshOverlayStatus()
            2 -> refreshUsageStatus()
            3 -> refreshNotifStatus()
            4 -> refreshBatteryStatus()
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 100) refreshNotifStatus()
    }
}
