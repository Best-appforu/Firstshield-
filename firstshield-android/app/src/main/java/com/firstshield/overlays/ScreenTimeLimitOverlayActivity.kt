package com.firstshield.overlays

import android.app.Activity
import android.os.Bundle
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import com.firstshield.R

/**
 * Screen Time Limit Overlay.
 * Shown once per day when the user hits their daily usage limit.
 * Clear dismiss button — never traps the user.
 */
class ScreenTimeLimitOverlayActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        )
        setContentView(R.layout.overlay_screen_time)

        val usageMin = intent.getLongExtra("usage_minutes", 0)
        val limitMin = intent.getLongExtra("limit_minutes", 120)
        val hours    = usageMin / 60
        val mins     = usageMin % 60

        val tvUsage  = findViewById<TextView>(R.id.tvUsage)
        val btnLock  = findViewById<Button>(R.id.btnLockPhone)
        val btnDismiss = findViewById<Button>(R.id.btnDismiss)

        tvUsage.text = if (hours > 0) "You've been on your phone for ${hours}h ${mins}m today."
                       else "You've been on your phone for ${mins} minutes today."

        // "Put down phone" — sends to home screen
        btnLock.setOnClickListener {
            startActivity(
                android.content.Intent(android.content.Intent.ACTION_MAIN).apply {
                    addCategory(android.content.Intent.CATEGORY_HOME)
                    flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                }
            )
            finish()
        }

        btnDismiss.setOnClickListener { finish() }
    }
}
