package com.firstshield.overlays

import android.app.Activity
import android.os.Bundle
import android.os.CountDownTimer
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import com.firstshield.R

/**
 * Eye Care 20-20-20 Overlay.
 * Full-screen, lightweight activity shown every 20 minutes.
 * User can dismiss instantly — never blocks interaction permanently.
 */
class EyeCareOverlayActivity : Activity() {

    private var timer: CountDownTimer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Make it overlay everything
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )
        setContentView(R.layout.overlay_eye_care)

        val tvCountdown = findViewById<TextView>(R.id.tvCountdown)
        val btnDismiss  = findViewById<Button>(R.id.btnDismiss)

        // 20-second countdown
        timer = object : CountDownTimer(20_000, 1_000) {
            override fun onTick(remaining: Long) {
                tvCountdown.text = "${remaining / 1000}s"
            }
            override fun onFinish() {
                tvCountdown.text = "Done! ✓"
                btnDismiss.text = "I feel better! 😊"
            }
        }.start()

        btnDismiss.setOnClickListener { finish() }
    }

    override fun onDestroy() {
        timer?.cancel()
        super.onDestroy()
    }
}
