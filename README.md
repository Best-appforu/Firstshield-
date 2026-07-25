# FirstShield — Android Source Code

A digital wellness & privacy guard app. **100% on-device — no internet permission.**

## Features

| Feature | How it works |
|---|---|
| 🛡 App Scanner | Flags risky permissions when you open an app |
| 👁 Eye Care (20-20-20) | Overlay reminder every N minutes of screen use |
| ⏱ Screen Time | Daily limit with fullscreen alert |
| 🎧 Bluetooth Alert | Popup ONLY when BT audio device connects (never on launch) |
| 🔋 Battery Exempt | Survives Doze mode — stays active in background |
| 🧙 Setup Wizard | One-time permission guide on first launch |

---

## Option A — Build with Android Studio (easiest)

1. Install **Android Studio** (free): https://developer.android.com/studio
2. Open Android Studio → **File → Open** → select the `firstshield-android/` folder
3. Wait for Gradle sync to finish (~2 min first time)
4. Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**
5. Click **locate** in the notification — the APK is at:
   `app/build/outputs/apk/debug/app-debug.apk`
6. Transfer to your phone and install

---

## Option B — Auto-build via GitHub Actions (no Android Studio needed)

1. Create a **free GitHub account**: https://github.com
2. Create a new repository and push this entire folder to it:
   ```bash
   cd firstshield-android
   git init
   git add .
   git commit -m "Initial FirstShield commit"
   git remote add origin https://github.com/YOUR_USERNAME/firstshield.git
   git push -u origin main
   ```
3. Go to your repo on GitHub → **Actions** tab
4. The **Build FirstShield APK** workflow runs automatically
5. When it finishes (≈3 min), go to **Releases** → download `app-debug.apk`

---

## Option C — Build from command line (Linux/Mac)

```bash
cd firstshield-android
chmod +x gradlew
./gradlew assembleDebug
# APK at: app/build/outputs/apk/debug/app-debug.apk
```
Requires: JDK 17+, Android SDK with API 34

---

## Install on Android phone

1. Copy `app-debug.apk` to your phone (USB, email, or Google Drive)
2. On the phone: **Settings → Security → Install unknown apps** → enable for your file manager
3. Open the APK file and tap **Install**
4. Launch **FirstShield** and follow the Setup Wizard

---

## Permissions required

| Permission | Why |
|---|---|
| Display over other apps | Shows overlay alerts |
| Usage access | Detects foreground app for scanner |
| Notifications | Persistent service notification |
| Battery optimization exempt | Keeps services alive in background |

No INTERNET permission — your data never leaves the device.
