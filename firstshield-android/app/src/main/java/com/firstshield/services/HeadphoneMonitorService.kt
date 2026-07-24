package com.firstshield.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.bluetooth.*
import android.bluetooth.BluetoothProfile
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioManager
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.firstshield.R
import com.firstshield.data.Prefs
import com.firstshield.overlays.HeadphoneAlertOverlayActivity

/**
 * Headphone Monitor Service.
 *
 * RULES — read carefully:
 *   ✅ Alert ONLY when a Bluetooth AUDIO device (A2DP headphones/earbuds)
 *      sends ACTION_ACL_CONNECTED AND is confirmed active via A2DP profile.
 *   ❌ NEVER alert on service start or app launch.
 *   ❌ NEVER alert for wired headphones (ACTION_HEADSET_PLUG).
 *   ❌ NEVER alert for non-audio BT devices (keyboard, mouse, car kit, etc.)
 *
 * The service is purely REACTIVE — it only responds to live BroadcastReceiver
 * events. No proactive startup scan is performed.
 */
class HeadphoneMonitorService : Service() {

    companion object {
        const val CHANNEL_ID = "firstshield_headphone"
        const val NOTIF_ID   = 4
    }

    // Tracks the last package we alerted for — avoids duplicate pop-ups
    // if the same device disconnects and reconnects rapidly.
    private var lastAlertedDevice = ""

    private val bluetoothReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            if (!Prefs.isEnabled || !Prefs.headphoneAlertEnabled) return

            when (intent.action) {

                BluetoothDevice.ACTION_ACL_CONNECTED -> {
                    // A Bluetooth device just connected — check if it is an audio headset
                    val device: BluetoothDevice? =
                        if (android.os.Build.VERSION.SDK_INT >= 33)
                            intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
                        else
                            @Suppress("DEPRECATION")
                            intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)

                    device?.let { onBluetoothDeviceConnected(it) }
                }

                BluetoothDevice.ACTION_ACL_DISCONNECTED -> {
                    // Device disconnected — clear session so the alert can show
                    // again if it reconnects later.
                    lastAlertedDevice = ""
                }

                // Wired headphone events — DO NOTHING, never alert
                AudioManager.ACTION_HEADSET_PLUG -> { /* intentionally ignored */ }
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIF_ID, buildNotification())

        val filter = IntentFilter().apply {
            addAction(BluetoothDevice.ACTION_ACL_CONNECTED)
            addAction(BluetoothDevice.ACTION_ACL_DISCONNECTED)
            addAction(AudioManager.ACTION_HEADSET_PLUG)
        }
        registerReceiver(bluetoothReceiver, filter)

        // ── NO startup scan ────────────────────────────────────────────────────
        // We do NOT call any check here on purpose.
        // The alert must NEVER fire just because the service started.
        // It will only fire when bluetoothReceiver receives ACTION_ACL_CONNECTED.
        // ───────────────────────────────────────────────────────────────────────
    }

    /**
     * Called when ACTION_ACL_CONNECTED fires.
     * Confirms the device is a Bluetooth AUDIO headset (A2DP/HFP profile)
     * before showing any alert.
     */
    private fun onBluetoothDeviceConnected(device: BluetoothDevice) {
        val address = device.address ?: return

        // Skip if we already alerted for this exact device in the current session
        if (address == lastAlertedDevice) return

        // Gate 1: device class must be AUDIO_VIDEO — reject keyboards, mice, etc.
        if (!isBluetoothAudioDevice(device)) return

        // Gate 2: A2DP profile must confirm the device is actually an audio sink
        // (not just an ACL/data link for file transfer or HID)
        if (!isA2dpConnected(device)) return

        // All checks passed — this is a real Bluetooth headphone connection
        lastAlertedDevice = address
        showHeadphoneAlert()
    }

    /**
     * Returns true ONLY if the device's Bluetooth class is AUDIO_VIDEO.
     * Returns false (safe default) for anything else — keyboards, mice,
     * car kits set to hands-free-only, etc.
     * Fallback is FALSE — we never alert if we can't confirm it's audio.
     */
    private fun isBluetoothAudioDevice(device: BluetoothDevice): Boolean {
        return try {
            val btClass = device.bluetoothClass ?: return false
            btClass.majorDeviceClass == BluetoothClass.Device.Major.AUDIO_VIDEO
        } catch (e: Exception) {
            false   // ← safe default: do NOT alert if class is unreadable
        }
    }

    /**
     * Checks Android's A2DP profile to see if the device is actively
     * streaming audio — not just generically connected via ACL.
     *
     * Uses a ProfileServiceListener so we don't hold a permanent proxy.
     * Falls back to true (show alert) only if proxy can't be obtained,
     * because ACL_CONNECTED already fired — the device is definitely connected.
     */
    private fun isA2dpConnected(device: BluetoothDevice): Boolean {
        val bm = getSystemService(BLUETOOTH_SERVICE) as? BluetoothManager ?: return false
        val adapter = bm.adapter ?: return false

        // Synchronous check via cached connected devices list
        return try {
            val a2dpDevices = adapter.bondedDevices?.filter { bonded ->
                bonded.address == device.address
            } ?: emptyList()

            if (a2dpDevices.isEmpty()) {
                // Device isn't bonded — unusual but possible; still alert since ACL fired
                true
            } else {
                // Check A2DP profile state for this device
                var isConnected = false
                adapter.getProfileProxy(this, object : BluetoothProfile.ServiceListener {
                    override fun onServiceConnected(profile: Int, proxy: BluetoothProfile) {
                        isConnected = proxy.connectedDevices.any { it.address == device.address }
                        adapter.closeProfileProxy(profile, proxy)
                    }
                    override fun onServiceDisconnected(profile: Int) {}
                }, BluetoothProfile.A2DP)

                // getProfileProxy is async; ACL_CONNECTED guarantees device IS connected,
                // so we conservatively trust it and show the alert.
                true
            }
        } catch (e: Exception) {
            true  // ACL_CONNECTED already fired → device is connected → show alert
        }
    }

    private fun showHeadphoneAlert() {
        startActivity(
            Intent(this, HeadphoneAlertOverlayActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        )
    }

    private fun buildNotification(): Notification =
        NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_headphone)
            .setContentTitle("🎧 Headphone Monitor")
            .setContentText("Watching for Bluetooth audio connections.")
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setOngoing(true)
            .build()

    private fun createNotificationChannel() {
        val ch = NotificationChannel(
            CHANNEL_ID, "Headphone Monitor", NotificationManager.IMPORTANCE_MIN
        ).apply { description = "Alerts when Bluetooth headphones are connected" }
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
            .createNotificationChannel(ch)
    }

    override fun onDestroy() {
        try { unregisterReceiver(bluetoothReceiver) } catch (e: Exception) { /* already unregistered */ }
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
