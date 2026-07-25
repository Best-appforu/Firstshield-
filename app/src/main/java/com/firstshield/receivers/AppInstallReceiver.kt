package com.firstshield.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.firstshield.data.Prefs
import com.firstshield.overlays.PermissionAlertOverlayActivity
import com.firstshield.scanner.AppScanner

/**
 * Listens for new app installs. When a high-risk app is installed,
 * immediately shows a permission warning overlay.
 *
 * Triggered by android.intent.action.PACKAGE_ADDED (local broadcast).
 */
class AppInstallReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        if (!Prefs.isEnabled || !Prefs.appScannerEnabled) return

        val pkg = intent.data?.schemeSpecificPart ?: return
        if (pkg == ctx.packageName) return

        Prefs.init(ctx)

        if (AppScanner.hasHighRiskPermissions(ctx, pkg)) {
            val result = AppScanner.scanApp(ctx, pkg)
            ctx.startActivity(
                Intent(ctx, PermissionAlertOverlayActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    putExtra("app_name",         result.appName)
                    putExtra("package_name",     result.packageName)
                    putExtra("permission_count", result.dangerousPermissions.size)
                    putExtra("tracker_count",    result.trackers.size)
                    putExtra("rating",           result.privacyRating.name)
                    putExtra("is_new_install",   true)
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
}
