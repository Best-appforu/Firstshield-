package com.firstshield.services

import android.app.*
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.firstshield.MainActivity
import com.firstshield.R
import com.firstshield.data.Prefs

/**
 * Master foreground service — starts/stops all child services.
 * Runs as a persistent notification so Android doesn't kill it.
 * All monitoring is LOCAL — zero network operations.
 */
class FirstShieldMainService : Service() {

    companion object {
        const val ACTION_ENABLE  = "com.firstshield.ACTION_ENABLE"
        const val ACTION_DISABLE = "com.firstshield.ACTION_DISABLE"
        const val CHANNEL_ID     = "firstshield_main"
        const val NOTIF_ID       = 1
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIF_ID, buildNotification(Prefs.isEnabled))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_ENABLE  -> setEnabled(true)
            ACTION_DISABLE -> setEnabled(false)
        }
        return START_STICKY  // Restart automatically if killed
    }

    private fun setEnabled(enabled: Boolean) {
        Prefs.isEnabled = enabled

        if (enabled) {
            startChildServices()
        } else {
            stopChildServices()
        }

        // Update notification to reflect new state
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(NOTIF_ID, buildNotification(enabled))

        // Tell MainActivity to update toggle UI
        sendBroadcast(Intent("com.firstshield.STATE_CHANGED").apply {
            putExtra("enabled", enabled)
        })
    }

    private fun startChildServices() {
        if (Prefs.eyeCareEnabled)        startService(Intent(this, EyeCareService::class.java))
        if (Prefs.screenTimeEnabled)     startService(Intent(this, ScreenTimeService::class.java))
        if (Prefs.headphoneAlertEnabled) startService(Intent(this, HeadphoneMonitorService::class.java))
        if (Prefs.appScannerEnabled)     startService(Intent(this, AppScannerService::class.java))
    }

    private fun stopChildServices() {
        stopService(Intent(this, EyeCareService::class.java))
        stopService(Intent(this, ScreenTimeService::class.java))
        stopService(Intent(this, HeadphoneMonitorService::class.java))
        stopService(Intent(this, AppScannerService::class.java))
    }

    private fun buildNotification(enabled: Boolean): Notification {
        val tapIntent = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val toggleAction = if (enabled) {
            val pauseIntent = PendingIntent.getService(
                this, 1,
                Intent(this, FirstShieldMainService::class.java).apply { action = ACTION_DISABLE },
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            NotificationCompat.Action(R.drawable.ic_shield, "Pause Alerts", pauseIntent)
        } else {
            val resumeIntent = PendingIntent.getService(
                this, 2,
                Intent(this, FirstShieldMainService::class.java).apply { action = ACTION_ENABLE },
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            NotificationCompat.Action(R.drawable.ic_shield, "Resume Alerts", resumeIntent)
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_shield)
            .setContentTitle(if (enabled) "FirstShield is Active 🛡" else "FirstShield Paused ⏸")
            .setContentText(if (enabled) "Monitoring privacy & health. Tap to manage." else "All alerts paused. Tap to resume.")
            .setContentIntent(tapIntent)
            .addAction(toggleAction)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID, "FirstShield Status",
            NotificationManager.IMPORTANCE_LOW
        ).apply { description = "Shows whether FirstShield is active or paused" }
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
