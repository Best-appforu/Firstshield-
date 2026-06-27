package com.firstshield.services

import android.app.*
import android.app.usage.UsageStatsManager
import android.content.Intent
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import com.firstshield.R
import com.firstshield.data.Prefs
import com.firstshield.overlays.PermissionAlertOverlayActivity
import com.firstshield.scanner.AppScanner

/**
 * App Scanner Service.
 * Polls UsageStatsManager (on-device) to detect which app is in the foreground.
 * When a high-risk app is opened, triggers a local permission alert overlay.
 *
 * All scanning is LOCAL — uses Android PackageManager and UsageStatsManager only.
 */
class AppScannerService : Service() {

    companion object {
        const val CHANNEL_ID     = "firstshield_app_scanner"
        const val NOTIF_ID       = 5
        const val POLL_INTERVAL  = 3_000L   // Poll every 3 seconds
        const val ALERT_COOLDOWN = 5 * 60_000L  // Don't re-alert same app within 5 min
    }

    private val handler = Handler(Looper.getMainLooper())
    private var lastAlertedPackage = ""
    private var lastAlertTimeMs = 0L
    private var lastForegroundPackage = ""

    private val pollRunnable = object : Runnable {
        override fun run() {
            if (Prefs.isEnabled && Prefs.appScannerEnabled) {
                checkForegroundApp()
            }
            handler.postDelayed(this, POLL_INTERVAL)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIF_ID, buildNotification("Watching for risky apps..."))
        handler.post(pollRunnable)
    }

    private fun checkForegroundApp() {
        val pkg = getForegroundPackage() ?: return
        if (pkg == packageName) return  // Don't alert on FirstShield itself
        if (pkg == lastForegroundPackage) return  // Same app still in foreground

        lastForegroundPackage = pkg

        val now = System.currentTimeMillis()
        val cooldownExpired = (now - lastAlertTimeMs) > ALERT_COOLDOWN
        val isNewApp = pkg != lastAlertedPackage

        if ((isNewApp || cooldownExpired) && AppScanner.hasHighRiskPermissions(this, pkg)) {
            val result = AppScanner.scanApp(this, pkg)
            lastAlertedPackage = pkg
            lastAlertTimeMs = now

            val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            nm.notify(NOTIF_ID, buildNotification("⚠ ${result.appName} has risky permissions"))

            startActivity(
                Intent(this, PermissionAlertOverlayActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    putExtra("app_name",        result.appName)
                    putExtra("package_name",    result.packageName)
                    putExtra("permission_count",result.dangerousPermissions.size)
                    putExtra("tracker_count",   result.trackers.size)
                    putExtra("rating",          result.privacyRating.name)
                    putExtra("permissions_summary",
                        result.dangerousPermissions.take(3).joinToString("\n") { "• ${it.friendlyName}" }
                    )
                    putExtra("trackers_summary",
                        result.trackers.take(3).joinToString(", ")
                    )
                }
            )
        }
    }

    /**
     * Gets the currently active foreground app using UsageStatsManager.
     * This is an on-device API — no data is transmitted.
     */
    private fun getForegroundPackage(): String? {
        val usm = getSystemService(USAGE_STATS_SERVICE) as UsageStatsManager
        val now = System.currentTimeMillis()
        val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_BEST, now - 5000, now)
        return stats?.maxByOrNull { it.lastTimeUsed }?.packageName
    }

    private fun buildNotification(text: String): Notification =
        NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_shield)
            .setContentTitle("🔍 App Scanner")
            .setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setOngoing(true)
            .build()

    private fun createNotificationChannel() {
        val ch = NotificationChannel(CHANNEL_ID, "App Scanner", NotificationManager.IMPORTANCE_MIN)
        ch.description = "Monitors foreground apps for risky permissions"
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(ch)
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
