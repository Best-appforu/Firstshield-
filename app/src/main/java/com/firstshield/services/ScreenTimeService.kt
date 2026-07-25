package com.firstshield.services

import android.app.*
import android.app.usage.UsageStatsManager
import android.content.Intent
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import com.firstshield.R
import com.firstshield.data.Prefs
import com.firstshield.overlays.ScreenTimeLimitOverlayActivity

/**
 * Screen Time Tracker — polls Android's UsageStatsManager (local API)
 * to measure daily screen usage. Fires an overlay when daily limit is reached.
 *
 * UsageStatsManager is entirely on-device. No data leaves the phone.
 */
class ScreenTimeService : Service() {

    companion object {
        const val CHANNEL_ID  = "firstshield_screen_time"
        const val NOTIF_ID    = 3
        const val POLL_INTERVAL_MS = 5 * 60 * 1000L  // Check every 5 minutes
    }

    private val handler = Handler(Looper.getMainLooper())

    private val checkRunnable = object : Runnable {
        override fun run() {
            if (Prefs.isEnabled && Prefs.screenTimeEnabled) {
                checkDailyUsage()
            }
            handler.postDelayed(this, POLL_INTERVAL_MS)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIF_ID, buildNotification(0))
        handler.post(checkRunnable)
    }

    private fun checkDailyUsage() {
        val todayUsageMs = getTodayUsageMs()
        val limitMs      = Prefs.dailyLimitMinutes * 60_000L

        // Update notification with current usage
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(NOTIF_ID, buildNotification(todayUsageMs / 60_000))

        if (todayUsageMs >= limitMs && !Prefs.dailyLimitAlertShown) {
            Prefs.dailyLimitAlertShown = true
            startActivity(
                Intent(this, ScreenTimeLimitOverlayActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    putExtra("usage_minutes", todayUsageMs / 60_000)
                    putExtra("limit_minutes", Prefs.dailyLimitMinutes.toLong())
                }
            )
        }
    }

    /**
     * Reads today's screen time using Android's local UsageStatsManager.
     * This API is entirely on-device — it reads from the OS usage database.
     */
    private fun getTodayUsageMs(): Long {
        val usm = getSystemService(USAGE_STATS_SERVICE) as UsageStatsManager
        val now = System.currentTimeMillis()
        val cal = java.util.Calendar.getInstance().apply {
            set(java.util.Calendar.HOUR_OF_DAY, 0)
            set(java.util.Calendar.MINUTE, 0)
            set(java.util.Calendar.SECOND, 0)
            set(java.util.Calendar.MILLISECOND, 0)
        }
        val stats = usm.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY, cal.timeInMillis, now
        )
        return stats?.sumOf { it.totalTimeInForeground } ?: 0L
    }

    private fun buildNotification(usedMinutes: Long): Notification {
        val hours   = usedMinutes / 60
        val minutes = usedMinutes % 60
        val text    = if (usedMinutes > 0) "Today: ${hours}h ${minutes}m / ${Prefs.dailyLimitMinutes}min limit"
                      else "Watching your daily screen time..."
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_clock)
            .setContentTitle("📱 Screen Time")
            .setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        val ch = NotificationChannel(CHANNEL_ID, "Screen Time", NotificationManager.IMPORTANCE_MIN)
        ch.description = "Tracks daily screen time for health warnings"
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(ch)
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
