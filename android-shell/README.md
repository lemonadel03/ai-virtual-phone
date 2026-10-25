# Float Android APK

This is the single Android app for Float. Its fullscreen WebView loads the Float site;
Huawei Push Kit receives system notifications while the page is closed. The browser
and APK show the same site, but have separate local storage.

The package ID is `app.floatphone.push`, reusing the Huawei AppGallery Connect Android
app and the signing key from the temporary `Float 推送助手`. A release build signed with
that same key updates the helper in place. The old `app.floatphone.shell` debug APK is a
different package and must be removed manually after any data in it has been backed up.

## Build locally

Place the existing `agconnect-services.json` in `android-shell/app/`. The file is ignored
by Git. Set `SHELL_SITE_URL` to the published Float URL, and use the existing helper's
keystore and alias through `SHELL_KEYSTORE_FILE`, `SHELL_KEYSTORE_PASSWORD`,
`SHELL_KEY_ALIAS`, and `SHELL_KEY_PASSWORD`. Run Gradle 8.7 with JDK 17:

```text
gradle -p android-shell assembleRelease
```

The signed file is `android-shell/app/build/outputs/apk/release/app-release.apk`.
Keep the signing key safe: future APK updates require the same key and a higher
`versionCode`.

## GitHub Actions

The manual **Build Float Android APK** workflow needs five repository secrets:
`HUAWEI_AGCONNECT_CONFIG_BASE64` (base64 of the existing JSON),
`SHELL_KEYSTORE_BASE64` (base64 of the existing keystore),
`SHELL_KEYSTORE_PASSWORD`, `SHELL_KEY_ALIAS`, and `SHELL_KEY_PASSWORD`.
`SHELL_SITE_URL` can be set as a repository variable or entered when starting the
workflow. It uploads the signed APK as `float-huawei-release`.

## Push delivery

The native app obtains a Huawei device token. When Float's personal Supabase push
cloud is connected in that APK, the page registers the token with `ai-phone-push`.
The server's `HUAWEI_PUSH_CLIENT_SECRET` remains only in Supabase Edge Function
secrets. `push-generate` sends Huawei notifications to that device. Tapping one
opens Float. Notification permission must be allowed on the phone.

The personal Supabase project needs the `push_huawei_devices` table in
`docs/personal-push-supabase.sql` and updated `ai-phone-push` and `push-generate`
functions. A delivery test from the phone is required before relying on background
notifications. The previous Supabase Realtime foreground service is no longer
registered, so the old permanent background status notification is gone.
