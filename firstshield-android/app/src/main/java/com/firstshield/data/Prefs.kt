package com.firstshield.data

import android.content.Context
import android.content.SharedPreferences

/**
 * All state is stored locally in SharedPreferences.
 * Zero network operations — nothing leaves the device.
 */
object Prefs {
    private const val NAME = "firstshield_prefs"

    private fun sp(ctx: Context): SharedPreferences =
        ctx.getSharedPreferences(NAME, Context.MODE_PRIVATE)

    // Master toggle
    var isEnabled: Boolean
        get() = _sp!!.getBoolean("enabled", true)
        set(v) { _sp!!.edit().putBoolean("enabled", v).apply() }

    // Eye care
    var eyeCareEnabled: Boolean
        get() = _sp!!.getBoolean("eye_care_enabled", true)
        set(v) { _sp!!.edit().putBoolean("eye_care_enabled", v).apply() }

    var eyeCareIntervalMinutes: Int
        get() = _sp!!.getInt("eye_care_interval", 20)
        set(v) { _sp!!.edit().putInt("eye_care_interval", v).apply() }

    var lastEyeCareAlertMs: Long
        get() = _sp!!.getLong("last_eye_care_ms", 0L)
        set(v) { _sp!!.edit().putLong("last_eye_care_ms", v).apply() }

    // Screen time
    var screenTimeEnabled: Boolean
        get() = _sp!!.getBoolean("screen_time_enabled", true)
        set(v) { _sp!!.edit().putBoolean("screen_time_enabled", v).apply() }

    var dailyLimitMinutes: Int
        get() = _sp!!.getInt("daily_limit_minutes", 120)
        set(v) { _sp!!.edit().putInt("daily_limit_minutes", v).apply() }

    var dailyLimitAlertShown: Boolean
        get() = _sp!!.getBoolean("daily_limit_alert_shown_${todayKey()}", false)
        set(v) { _sp!!.edit().putBoolean("daily_limit_alert_shown_${todayKey()}", v).apply() }

    // Headphone
    var headphoneAlertEnabled: Boolean
        get() = _sp!!.getBoolean("headphone_alert_enabled", true)
        set(v) { _sp!!.edit().putBoolean("headphone_alert_enabled", v).apply() }

    // App scanner
    var appScannerEnabled: Boolean
        get() = _sp!!.getBoolean("app_scanner_enabled", true)
        set(v) { _sp!!.edit().putBoolean("app_scanner_enabled", v).apply() }

    // Setup wizard — false on first install, set to true after wizard completes
    var setupComplete: Boolean
        get() = _sp!!.getBoolean("setup_complete", false)
        set(v) { _sp!!.edit().putBoolean("setup_complete", v).apply() }

    private var _sp: SharedPreferences? = null

    fun init(ctx: Context) {
        _sp = sp(ctx)
    }

    private fun todayKey(): String {
        val cal = java.util.Calendar.getInstance()
        return "${cal.get(java.util.Calendar.YEAR)}_${cal.get(java.util.Calendar.DAY_OF_YEAR)}"
    }
}
