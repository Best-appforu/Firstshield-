package com.firstshield.data

/**
 * Hardcoded local tracker database — no network, no server.
 * Maps known ad/analytics SDK package prefixes to tracker names.
 * Sourced from publicly available tracker lists (Exodus Privacy research).
 */
object TrackerDatabase {

    data class TrackerInfo(
        val name: String,
        val category: String,   // "Advertising" | "Analytics" | "Profiling" | "Social"
        val risk: String        // "High" | "Medium" | "Low"
    )

    private val KNOWN_TRACKERS: Map<String, TrackerInfo> = mapOf(
        "com.google.android.gms.ads"         to TrackerInfo("Google Ads",             "Advertising", "High"),
        "com.google.firebase.analytics"      to TrackerInfo("Firebase Analytics",      "Analytics",   "Medium"),
        "com.facebook.ads"                   to TrackerInfo("Facebook Audience Network","Advertising", "High"),
        "com.facebook.appevents"             to TrackerInfo("Facebook App Events",      "Profiling",   "High"),
        "com.appsflyer"                      to TrackerInfo("AppsFlyer",                "Analytics",   "Medium"),
        "io.branch.referral"                 to TrackerInfo("Branch",                   "Analytics",   "Medium"),
        "com.moengage"                       to TrackerInfo("MoEngage",                 "Analytics",   "Medium"),
        "com.clevertap.android"              to TrackerInfo("CleverTap",                "Profiling",   "High"),
        "com.adjust.sdk"                     to TrackerInfo("Adjust",                   "Analytics",   "Medium"),
        "com.mixpanel.android"               to TrackerInfo("Mixpanel",                 "Analytics",   "Medium"),
        "com.amplitude.android"              to TrackerInfo("Amplitude",                "Analytics",   "Medium"),
        "com.segment.analytics"              to TrackerInfo("Segment",                  "Profiling",   "High"),
        "io.intercom.android"                to TrackerInfo("Intercom",                 "Analytics",   "Low"),
        "com.onesignal"                      to TrackerInfo("OneSignal",                "Advertising", "Medium"),
        "com.ironsource.mediationsdk"        to TrackerInfo("IronSource Ads",           "Advertising", "High"),
        "com.unity3d.ads"                    to TrackerInfo("Unity Ads",                "Advertising", "Medium"),
        "com.chartboost"                     to TrackerInfo("Chartboost",               "Advertising", "Medium"),
        "com.vungle.warren"                  to TrackerInfo("Vungle",                   "Advertising", "High"),
        "com.inmobi"                         to TrackerInfo("InMobi",                   "Advertising", "High"),
        "com.startapp.android"               to TrackerInfo("StartApp",                 "Advertising", "High"),
        "com.airbnb.lottie"                  to TrackerInfo("Lottie (safe — animation)","Analytics",   "Low"),
        "io.fabric"                          to TrackerInfo("Fabric/Crashlytics",        "Analytics",   "Low"),
        "com.google.android.datatransport"   to TrackerInfo("Google Data Transport",     "Analytics",   "Medium"),
        "com.criteo.publisher"               to TrackerInfo("Criteo",                   "Advertising", "High"),
        "net.pubnative"                      to TrackerInfo("PubNative",                "Advertising", "High"),
        "com.tapjoy"                         to TrackerInfo("Tapjoy",                   "Advertising", "Medium"),
        "com.smaato.sdk"                     to TrackerInfo("Smaato",                   "Advertising", "Medium"),
        "com.adcolony"                       to TrackerInfo("AdColony",                 "Advertising", "High"),
        "com.mopub"                          to TrackerInfo("MoPub",                    "Advertising", "High"),
        "com.loopme"                         to TrackerInfo("LoopMe",                   "Advertising", "Medium"),
    )

    /**
     * Scan a list of class/package names found in an APK or loaded dex
     * and return matching trackers. Entirely local — no network call.
     */
    fun detectTrackers(packageNames: List<String>): List<TrackerInfo> {
        val found = mutableListOf<TrackerInfo>()
        for (pkg in packageNames) {
            for ((prefix, info) in KNOWN_TRACKERS) {
                if (pkg.startsWith(prefix) && found.none { it.name == info.name }) {
                    found.add(info)
                }
            }
        }
        return found
    }

    /**
     * Quick lookup by full app package (e.g. "com.instagram.android")
     * Returns curated tracker count for well-known apps.
     */
    private val KNOWN_APP_TRACKERS: Map<String, List<String>> = mapOf(
        "com.instagram.android"      to listOf("Google Ads", "Facebook App Events", "Facebook Audience Network", "Adjust", "Branch", "Crashlytics", "Firebase Analytics"),
        "com.facebook.katana"        to listOf("Facebook App Events", "Facebook Audience Network", "Google Ads", "Branch", "Crashlytics", "Adjust", "Segment", "Amplitude"),
        "com.zhiliaoapp.musically"   to listOf("Google Ads", "AppsFlyer", "Branch", "CleverTap", "Adjust", "Firebase Analytics"),
        "com.snapchat.android"       to listOf("Google Ads", "Snap Measurement", "Firebase Analytics", "Branch", "AppsFlyer"),
        "com.whatsapp"               to listOf("Firebase Analytics", "Google Data Transport", "Crashlytics"),
        "com.google.android.youtube" to listOf("Google Ads", "Firebase Analytics", "Google Data Transport"),
        "com.amazon.mShop.android"   to listOf("Google Ads", "Firebase Analytics", "Adjust", "Branch", "IronSource Ads"),
        "com.spotify.music"          to listOf("Google Ads", "Firebase Analytics", "Adjust", "AppsFlyer"),
    )

    fun getCuratedTrackers(packageName: String): List<String> =
        KNOWN_APP_TRACKERS[packageName] ?: emptyList()
}
