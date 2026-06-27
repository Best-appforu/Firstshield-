package com.firstshield.overlays

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import com.firstshield.R
import com.firstshield.scanner.PrivacyRating

/**
 * Permission Alert Overlay.
 * Shown when a high-risk app is opened or newly installed.
 * Shows app name, risky permissions, tracker count, and privacy rating.
 * All data comes from LOCAL scan — no network involved.
 */
class PermissionAlertOverlayActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        )
        setContentView(R.layout.overlay_permission_alert)

        val appName     = intent.getStringExtra("app_name")     ?: "This App"
        val pkgName     = intent.getStringExtra("package_name") ?: ""
        val permCount   = intent.getIntExtra("permission_count", 0)
        val trackerCount= intent.getIntExtra("tracker_count", 0)
        val rating      = intent.getStringExtra("rating") ?: "YELLOW"
        val isNew       = intent.getBooleanExtra("is_new_install", false)
        val permSummary = intent.getStringExtra("permissions_summary") ?: ""
        val trackerSummary = intent.getStringExtra("trackers_summary") ?: ""

        // Title
        val tvTitle = findViewById<TextView>(R.id.tvTitle)
        tvTitle.text = if (isNew) "⚠ New App Installed: $appName"
                       else "⚠ $appName is now open"

        // Privacy rating badge
        val tvRating = findViewById<TextView>(R.id.tvRating)
        val (ratingText, ratingColor) = when (PrivacyRating.valueOf(rating)) {
            PrivacyRating.RED    -> "🔴 HIGH RISK" to 0xFFE57373.toInt()
            PrivacyRating.YELLOW -> "🟡 MEDIUM RISK" to 0xFFD4A373.toInt()
            PrivacyRating.GREEN  -> "🟢 LOW RISK" to 0xFF62B685.toInt()
        }
        tvRating.text = ratingText
        tvRating.setTextColor(ratingColor)

        // Permissions
        val tvPerms = findViewById<TextView>(R.id.tvPermissions)
        tvPerms.text = if (permSummary.isNotEmpty())
            "Accesses:\n$permSummary"
        else "No high-risk permissions detected."

        // Trackers
        val tvTrackers = findViewById<TextView>(R.id.tvTrackers)
        tvTrackers.text = if (trackerCount > 0)
            "🔎 $trackerCount hidden tracker(s) found${if (trackerSummary.isNotEmpty()) ": $trackerSummary" else ""}"
        else "✅ No known trackers detected."

        // "Manage permissions" — takes user to app settings (LOCAL action)
        val btnManage = findViewById<Button>(R.id.btnManagePermissions)
        btnManage.setOnClickListener {
            startActivity(
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.parse("package:$pkgName")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            )
            finish()
        }

        // Easy dismiss — always reachable
        findViewById<Button>(R.id.btnDismiss).setOnClickListener { finish() }
    }
}
