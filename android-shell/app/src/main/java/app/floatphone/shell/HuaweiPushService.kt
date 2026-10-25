package app.floatphone.shell

import android.os.Bundle
import com.huawei.hms.push.HmsMessageService

/** Receives Huawei token rotations even when the UI is not running. */
class HuaweiPushService : HmsMessageService() {
    override fun onNewToken(token: String?) {
        saveToken(token)
    }

    override fun onNewToken(token: String?, bundle: Bundle?) {
        saveToken(token)
    }

    private fun saveToken(token: String?) {
        if (!token.isNullOrBlank()) {
            getSharedPreferences("push", MODE_PRIVATE).edit().putString("token", token).apply()
        }
    }
}
