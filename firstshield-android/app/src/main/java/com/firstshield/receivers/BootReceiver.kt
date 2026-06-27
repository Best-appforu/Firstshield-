package com.firstshield.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.firstshield.data.Prefs
import com.firstshield.services.FirstShieldMainService

/**
 * Auto-starts FirstShield after device reboot.
 * Respects the last saved enabled/disabled state from Prefs.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        Prefs.init(ctx)
        if (Prefs.isEnabled) {
            ctx.startForegroundService(Intent(ctx, FirstShieldMainService::class.java))
        }
    }
}
