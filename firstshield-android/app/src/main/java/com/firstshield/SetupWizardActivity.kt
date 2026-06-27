package com.firstshield

import android.app.AppOpsManager
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
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
 * Guides the user through granting the 3 special permissions FirstShield needs.
 * Step 0 — Welcome
 * Step 1 — Overlay permission   (SYSTEM_ALERT_WINDOW)
 * Step 2 — Usage access         (PACKAGE_USAGE_STATS)
 * Step 3 — Notifications        (POST_NOTIFICATIONS, Android 13+ only)
 * Step 4 — All done!
 *
 * Shown only on first launch. Prefs.setupComplete gates it.
 */
class SetupWizardActivity : AppCompatActivity() {

    private var currentStep = 0
    private val totalSteps  = 5  // 0-welcome, 1-overlay, 2-usage, 3-notif, 4-done

    // Step panels
    private lateinit var panelWelcome: View
    private lateinit var panelOverlay: View
    private lateinit var panelUsage: View
    private lateinit var panelNotif: View
    private lateinit var panelDone: View

    // Step indicator dots
    private lateinit var dots: Array<View>

    // Bottom navigation
    private lateinit var btnNext: Button
    private lateinit var btnSkip: TextView

    // Status indicators per step
    private lateinit var tvOverlayStatus: TextView
    private lateinit var tvUsageStatus: TextView
    private lateinit var tvNotifStatus: TextView

    // Grant buttons
    private lateinit var btnGrantOverlay: Button
    private lateinit var btnGrantUsage: Button
    private lateinit var btnGrantNotif: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Prefs.init(this)

        // If setup already done, go straight to MainActivity
        if (Prefs.setupComplete) {
            launchMain()
            return
        }

        setContentView(R.layout.activity_setup_wizard)

        // Step panels
        panelWelcome = findViewById(R.id.panelWelcome)
        panelOverlay = findViewById(R.id.panelOverlay)
        panelUsage   = findViewById(R.id.panelUsage)
        panelNotif   = findViewById(R.id.panelNotif)
        panelDone    = findViewById(R.id.panelDone)

        // Step dots
        dots = arrayOf(
            findViewById(R.id.dot0),
            findViewById(R.id.dot1),
            findViewById(R.id.dot2),
            findViewById(R.id.dot3),
            findViewById(R.id.dot4)
        )

        // Navigation
        btnNext = findViewById(R.id.btnNext)
        btnSkip = findViewById(R.id.tvSkip)

        // Status indicators
        tvOverlayStatus = findViewById(R.id.tvOverlayStatus)
        tvUsageStatus   = findViewById(R.id.tvUsageStatus)
        tvNotifStatus   = findViewById(R.id.tvNotifStatus)

        // Grant buttons
        btnGrantOverlay = findViewById(R.id.btnGrantOverlay)
        btnGrantUsage   = findViewById(R.id.btnGrantUsage)
        btnGrantNotif   = findViewById(R.id.btnGrantNotif)

        // Welcome step "Let's Start" button wires to same next logic
        findViewById<Button>(R.id.btnWelcomeStart).setOnClickListener { goNext() }

        // Grant buttons
        btnGrantOverlay.setOnClickListener { openOverlaySettings() }
        btnGrantUsage.setOnClickListener   { openUsageSettings() }
        btnGrantNotif.setOnClickListener   { requestNotifPermission() }

        btnNext.setOnClickListener { goNext() }
        btnSkip.setOnClickListener { skipToEnd() }

        // Done step: "Start FirstShield" button
        findViewById<Button>(R.id.btnStartShield).setOnClickListener {
            finishSetup()
        }

        showStep(0)
    }

    private fun goNext() {
        val next = currentStep + 1
        if (next >= totalSteps) {
            finishSetup()
        } else {
            showStep(next)
        }
    }

    private fun skipToEnd() {
        showStep(4)
    }

    private fun showStep(step: Int) {
        currentStep = step

        // Animate out current, in new panel
        val fadeIn  = AnimationUtils.loadAnimation(this, android.R.anim.fade_in)
        fadeIn.duration = 300

        panelWelcome.visibility = if (step == 0) View.VISIBLE else View.GONE
        panelOverlay.visibility = if (step == 1) View.VISIBLE else View.GONE
        panelUsage.visibility   = if (step == 2) View.VISIBLE else View.GONE
        panelNotif.visibility   = if (step == 3) View.VISIBLE else View.GONE
        panelDone.visibility    = if (step == 4) View.VISIBLE else View.GONE

        // Animate the visible panel
        currentPanel()?.startAnimation(fadeIn)

        // Update step dots
        dots.forEachIndexed { i, dot ->
            dot.setBackgroundResource(
                if (i == step) R.drawable.dot_active else R.drawable.dot_inactive
            )
        }

        // Update navigation bar
        when (step) {
            0 -> {
                btnNext.visibility = View.GONE
                btnSkip.visibility = View.GONE
            }
            4 -> {
                btnNext.visibility = View.GONE
                btnSkip.visibility = View.GONE
            }
            else -> {
                btnNext.visibility = View.VISIBLE
                btnSkip.visibility = View.VISIBLE
                btnNext.text = if (step == 3) "Finish →" else "Next →"
            }
        }

        // Refresh status indicators when revisiting permission steps
        if (step == 1) refreshOverlayStatus()
        if (step == 2) refreshUsageStatus()
        if (step == 3) refreshNotifStatus()
        if (step == 4) populateDoneSummary()
    }

    private fun currentPanel(): View? = when (currentStep) {
        0 -> panelWelcome
        1 -> panelOverlay
        2 -> panelUsage
        3 -> panelNotif
        4 -> panelDone
        else -> null
    }

    // ── Overlay permission ────────────────────────────────────────────────────

    private fun openOverlaySettings() {
        startActivity(
            Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName"))
        )
    }

    private fun refreshOverlayStatus() {
        val granted = Settings.canDrawOverlays(this)
        applyStatus(tvOverlayStatus, btnGrantOverlay, granted)
    }

    // ── Usage access ──────────────────────────────────────────────────────────

    private fun openUsageSettings() {
        startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
    }

    private fun refreshUsageStatus() {
        val granted = hasUsageStats()
        applyStatus(tvUsageStatus, btnGrantUsage, granted)
    }

    private fun hasUsageStats(): Boolean {
        val appOps = getSystemService(APP_OPS_SERVICE) as AppOpsManager
        val mode   = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    // ── Notification permission (Android 13+) ─────────────────────────────────

    private fun requestNotifPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(
                this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 100
            )
        }
    }

    private fun refreshNotifStatus() {
        val granted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                android.content.pm.PackageManager.PERMISSION_GRANTED
        } else true  // Pre-Android 13 doesn't need this

        applyStatus(tvNotifStatus, btnGrantNotif, granted)

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            panelNotif.findViewById<TextView>(R.id.tvNotifNote).text =
                "Your Android version grants notification access automatically. ✓"
            btnGrantNotif.isEnabled = false
        }
    }

    // ── Done summary ──────────────────────────────────────────────────────────

    private fun populateDoneSummary() {
        val overlay = Settings.canDrawOverlays(this)
        val usage   = hasUsageStats()
        val notif   = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                android.content.pm.PackageManager.PERMISSION_GRANTED
        else true

        val tvSummary = findViewById<TextView>(R.id.tvDoneSummary)
        val sb = StringBuilder()
        sb.appendLine(if (overlay) "✅  Pop-up overlays — working" else "⚠️  Pop-up overlays — not granted (alerts won't show)")
        sb.appendLine(if (usage)   "✅  Screen time tracking — working" else "⚠️  Screen time — not granted (screen-time alerts disabled)")
        sb.appendLine(if (notif)   "✅  Notifications — working" else "⚠️  Notifications — not granted (status bar alerts won't show)")
        sb.appendLine()
        sb.append("You can grant any missing permissions from the main screen later.")
        tvSummary.text = sb.toString().trim()
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun applyStatus(tvStatus: TextView, btnGrant: Button, granted: Boolean) {
        if (granted) {
            tvStatus.text = "✅ Granted"
            tvStatus.setTextColor(0xFF2E7D52.toInt())
            btnGrant.text = "Granted ✓"
            btnGrant.isEnabled = false
            btnGrant.alpha = 0.6f
        } else {
            tvStatus.text = "⚠ Not yet granted"
            tvStatus.setTextColor(0xFF8B3A00.toInt())
            btnGrant.text = "Grant Permission →"
            btnGrant.isEnabled = true
            btnGrant.alpha = 1.0f
        }
    }

    private fun finishSetup() {
        Prefs.setupComplete = true
        launchMain()
    }

    private fun launchMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    // Re-check permissions when user returns from Settings
    override fun onResume() {
        super.onResume()
        when (currentStep) {
            1 -> refreshOverlayStatus()
            2 -> refreshUsageStatus()
            3 -> refreshNotifStatus()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 100) refreshNotifStatus()
    }
}
