package com.firstshield.scanner

import android.content.Context
import android.content.pm.PackageManager
import android.content.pm.PermissionInfo
import com.firstshield.data.TrackerDatabase

data class PermissionResult(
    val permissionName: String,
    val friendlyName: String,
    val riskLevel: String,    // "High" | "Medium" | "Low"
    val reason: String
)

data class AppScanResult(
    val packageName: String,
    val appName: String,
    val dangerousPermissions: List<PermissionResult>,
    val trackers: List<String>,
    val privacyRating: PrivacyRating
)

enum class PrivacyRating { GREEN, YELLOW, RED }

/**
 * Scans installed apps for dangerous permissions and known trackers.
 * 100% local — uses Android's PackageManager API only. No network calls.
 */
object AppScanner {

    private val DANGEROUS_PERMISSIONS: Map<String, Triple<String, String, String>> = mapOf(
        "android.permission.ACCESS_FINE_LOCATION"    to Triple("📍 Precise Location", "High",   "Tracks your exact GPS position"),
        "android.permission.ACCESS_COARSE_LOCATION"  to Triple("📍 Approximate Location", "Medium","Tracks your general area"),
        "android.permission.ACCESS_BACKGROUND_LOCATION" to Triple("📍 Background Location", "High", "Tracks you even when app is closed"),
        "android.permission.READ_CONTACTS"           to Triple("👥 Read Contacts", "High",   "Reads your entire phone book"),
        "android.permission.WRITE_CONTACTS"          to Triple("👥 Write Contacts", "Medium","Can add/edit your contacts"),
        "android.permission.RECORD_AUDIO"            to Triple("🎤 Microphone", "High",      "Can listen through your microphone"),
        "android.permission.CAMERA"                  to Triple("📷 Camera", "Medium",        "Can take photos and videos"),
        "android.permission.READ_CALL_LOG"           to Triple("📞 Call History", "High",    "Sees who you called and when"),
        "android.permission.PROCESS_OUTGOING_CALLS"  to Triple("📞 Call Interception","High","Can intercept your phone calls"),
        "android.permission.READ_SMS"                to Triple("💬 Read SMS", "High",        "Reads all your text messages"),
        "android.permission.SEND_SMS"                to Triple("💬 Send SMS", "High",        "Can send texts from your number"),
        "android.permission.RECEIVE_SMS"             to Triple("💬 Receive SMS", "High",     "Intercepts incoming messages"),
        "android.permission.READ_EXTERNAL_STORAGE"   to Triple("💾 Read Files", "Medium",    "Accesses all files on your phone"),
        "android.permission.WRITE_EXTERNAL_STORAGE"  to Triple("💾 Write Files", "Low",      "Can save files to your phone"),
        "android.permission.BODY_SENSORS"            to Triple("❤️ Health Sensors", "High",  "Reads your heart rate & health data"),
        "android.permission.GET_ACCOUNTS"            to Triple("🔑 Account Access", "High",  "Sees all accounts logged in on your phone"),
        "android.permission.USE_BIOMETRIC"           to Triple("🔏 Biometrics", "Medium",    "Can use fingerprint/face data"),
        "android.permission.BLUETOOTH_CONNECT"       to Triple("🔵 Bluetooth", "Low",        "Can pair with Bluetooth devices"),
    )

    /**
     * Scan a single app package and return a full analysis result.
     * All logic runs locally using Android's PackageManager.
     */
    fun scanApp(ctx: Context, packageName: String): AppScanResult {
        val pm = ctx.packageManager
        val appName = try {
            pm.getApplicationLabel(pm.getApplicationInfo(packageName, 0)).toString()
        } catch (e: Exception) { packageName }

        val permissions = mutableListOf<PermissionResult>()
        try {
            val pkgInfo = pm.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS)
            pkgInfo.requestedPermissions?.forEach { perm ->
                DANGEROUS_PERMISSIONS[perm]?.let { (friendly, risk, reason) ->
                    permissions.add(PermissionResult(perm, friendly, risk, reason))
                }
            }
        } catch (e: Exception) { /* Package not accessible */ }

        // Tracker check — curated local list, no network
        val trackers = TrackerDatabase.getCuratedTrackers(packageName).ifEmpty {
            TrackerDatabase.detectTrackers(listOf(packageName))
                .map { it.name }
        }

        val rating = when {
            permissions.count { it.riskLevel == "High" } >= 3 || trackers.size >= 5 -> PrivacyRating.RED
            permissions.count { it.riskLevel == "High" } >= 1 || trackers.size >= 2 -> PrivacyRating.YELLOW
            else -> PrivacyRating.GREEN
        }

        return AppScanResult(packageName, appName, permissions, trackers, rating)
    }

    /**
     * Returns true if the app has any HIGH-risk permission that
     * should trigger an immediate overlay alert.
     */
    fun hasHighRiskPermissions(ctx: Context, packageName: String): Boolean {
        val pm = ctx.packageManager
        return try {
            val pkgInfo = pm.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS)
            pkgInfo.requestedPermissions?.any { perm ->
                DANGEROUS_PERMISSIONS[perm]?.second == "High"
            } == true
        } catch (e: Exception) { false }
    }

    /** Scan all user-installed apps (excludes system apps). */
    fun scanAllUserApps(ctx: Context): List<AppScanResult> {
        val pm = ctx.packageManager
        val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
        return apps
            .filter { (it.flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM) == 0 }
            .map { scanApp(ctx, it.packageName) }
    }
}
