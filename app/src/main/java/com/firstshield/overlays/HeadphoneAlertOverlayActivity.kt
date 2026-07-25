package com.firstshield.overlays

import android.app.Activity
import android.os.Bundle
import android.view.WindowManager
import android.widget.Button
import com.firstshield.R

/**
 * Bluetooth Headphone Health Alert Overlay.
 * ONLY shown when a wireless/Bluetooth audio device is detected.
 * Never shown for wired headphones or when no headphones are in use.
 * Easy one-tap dismiss.
 */
class HeadphoneAlertOverlayActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        setContentView(R.layout.overlay_headphone)

        findViewById<Button>(R.id.btnGotIt).setOnClickListener { finish() }
        findViewById<Button>(R.id.btnDismiss).setOnClickListener { finish() }
    }
}
