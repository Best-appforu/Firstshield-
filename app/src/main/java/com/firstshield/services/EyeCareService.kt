package com.firstshield.services

import android.app.*
import android.content.Intent
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import com.firstshield.R
import com.firstshield.data.Prefs
import com.firstshield.overlays.EyeCareOverlayActivity

/**
 * Eye Care 20-20-20 Timer Service.
 * Runs a local countdown. Every [interval] minutes of continuous screen use,
 * it fires a full-screen overlay reminding the user to rest their eyes.
 *
 * 100% local — no network, no data upload.
 */
class EyeCareService : Service() {

    companion object {
        const val CHANNEL_ID = "firstshield_eye_care"
        const val NOTIF_ID   = 2
    }

    private val handler = Handler(Looper.getMainLooper())
    private var intervalMs: Long = 20 * 60 * 1000L  // 20 minutes default

    private val timerRunnable = object : Runnable {
        override fun run() {
            if (!Prefs.isEnabled || !Prefs.eyeCareEnabled) {
                // Master toggle is off — do nothing, check again later
                handler.postDelayed(this, 60_000)
                return
            }
            triggerEyeCareAlert()
            // Schedule next alert
            intervalMs = Prefs.eyeCareIntervalMinutes * 60_000L
            handler.postDelayed(this, intervalMs)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIF_ID, buildNotification())
        intervalMs = Prefs.eyeCareIntervalMinutes * 60_000L
        handler.postDelayed(timerRunnable, intervalMs)
    }

    private fun triggerEyeCareAlert() {
        Prefs.lastEyeCareAlertMs = System.currentTimeMillis()
        startActivity(
            Intent(this, EyeCareOverlayActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        )
    }

    private fun buildNotification(): Notification =
        NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_eye)
            .setContentTitle("👁 Eye Care Active")
            .setContentText("You'll be reminded to rest your eyes every ${Prefs.eyeCareIntervalMinutes} min.")
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setOngoing(true)
            .build()

    private fun createNotificationChannel() {
        val ch = NotificationChannel(CHANNEL_ID, "Eye Care Timer", NotificationManager.IMPORTANCE_MIN)
        ch.description = "Background timer for 20-20-20 eye rest reminders"
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(ch)
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
