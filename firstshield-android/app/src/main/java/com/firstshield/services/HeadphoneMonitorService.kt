package com.firstshield.services

import android.app.*
import android.bluetooth.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.IBinder
import com.firstshield.R
import com.firstshield.data.Prefs
import com.firstshield.overlays.HeadphoneAlertOverlayActivity

/**
 * Headphone Monitor Service.
 *
 * Listens for audio device connection events using Android's local
 * AudioManager and BluetoothProfile APIs. No network involved.
 *
 * ONLY triggers the alert when a BLUETOOTH/WIRELESS headset is connected.
 * Does NOT alert for wired headphones or when nothing is plugged in.
 */
class HeadphoneMonitorService : Service() {

    companion object {
        const val CHANNEL_ID = "firstshield_headphone"
        const val NOTIF_ID   = 4
    }

    private var alertShownForCurrentSession = false

    private val audioReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            if (!Prefs.isEnabled || !Prefs.headphoneAlertEnabled) return

            when (intent.action) {
                BluetoothDevice.ACTION_ACL_CONNECTED -> {
                    val device = if (android.os.Build.VERSION.SDK_INT >= 33)
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
                    else
                        @Suppress("DEPRECATION") intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)

                    device?.let { handleBluetoothConnect(it) }
                }
                BluetoothDevice.ACTION_ACL_DISCONNECTED -> {
                    // Reset so alert can show again next time BT headphone connects
                    alertShownForCurrentSession = false
                }
                AudioManager.ACTION_HEADSET_PLUG -> {
                    // Wired headphone plugged in or unplugged — do NOT alert
                    alertShownForCurrentSession = false
                }
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
        registerReceiver(audioReceiver, filter)

        // Check if a BT audio device is already connected at startup
        checkExistingBluetoothAudio()
    }

    private fun handleBluetoothConnect(device: BluetoothDevice) {
        if (alertShownForCurrentSession) return

        // Only alert for audio-capable Bluetooth devices (headphones/earbuds)
        val bm = getSystemService(BLUETOOTH_SERVICE) as BluetoothManager
        val isAudioDevice = bm.adapter?.bondedDevices?.any {
            it.address == device.address && isAudioHeadset(it)
        } == true

        if (isAudioDevice) {
            alertShownForCurrentSession = true
            triggerBluetoothAlert()
        }
    }

    private fun isAudioHeadset(device: BluetoothDevice): Boolean {
        // Check major device class — 0x0400 = AUDIO_VIDEO
        return try {
            val clazz = device.bluetoothClass
            clazz.majorDeviceClass == BluetoothClass.Device.Major.AUDIO_VIDEO
        } catch (e: Exception) { true }  // Assume audio if we can't tell
    }

    private fun checkExistingBluetoothAudio() {
        if (alertShownForCurrentSession) return
        val am = getSystemService(AUDIO_SERVICE) as AudioManager
        val devices = am.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
        val hasBluetoothAudio = devices.any {
            it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
            it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
        }
        val hasWiredAudio = devices.any {
            it.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES ||
            it.type == AudioDeviceInfo.TYPE_WIRED_HEADSET
        }

        // Only alert for Bluetooth — never for wired
        if (hasBluetoothAudio && !hasWiredAudio && Prefs.isEnabled && Prefs.headphoneAlertEnabled) {
            alertShownForCurrentSession = true
            triggerBluetoothAlert()
        }
    }

    private fun triggerBluetoothAlert() {
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
            .setContentText("Will alert if wireless headphones are connected.")
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setOngoing(true)
            .build()

    private fun createNotificationChannel() {
        val ch = NotificationChannel(CHANNEL_ID, "Headphone Monitor", NotificationManager.IMPORTANCE_MIN)
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(ch)
    }

    override fun onDestroy() {
        try { unregisterReceiver(audioReceiver) } catch (e: Exception) { }
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
