import { isPersonalPushCloudActive, personalPushFetch } from "./personal-push-cloud";
import { isShellEnvironment, markAccountPushSubscribed } from "./push-client";

let lastLinkedToken = "";
let linkingToken = "";

type HuaweiShellWindow = Window & { AndroidShell?: { requestHuaweiPushToken?: () => void } };

/** Ask the native shell to replay its saved token after cloud setup changes. */
export function requestHuaweiPushTokenSync(): void {
  if (typeof window === "undefined" || !isShellEnvironment()) return;
  (window as HuaweiShellWindow).AndroidShell?.requestHuaweiPushToken?.();
}

export function listenForHuaweiPushToken(): () => void {
  if (typeof window === "undefined" || !isShellEnvironment()) return () => undefined;
  const onToken = (event: Event) => {
    const token = (event as CustomEvent<unknown>).detail;
    if (typeof token !== "string" || !token || !isPersonalPushCloudActive()) return;
    if (token === lastLinkedToken || token === linkingToken) return;
    linkingToken = token;
    void (async () => {
      try {
        const response = await personalPushFetch("huawei-device", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        const data = await response.json().catch(() => ({})) as { ok?: boolean };
        if (!response.ok || !data.ok) return;
        lastLinkedToken = token;
        markAccountPushSubscribed(true);
        window.dispatchEvent(new Event("float:huawei-linked"));
      } catch {
        // A later page load or cloud reconnect retries with the saved native token.
      } finally {
        linkingToken = "";
      }
    })();
  };
  window.addEventListener("float:huawei-token", onToken);
  requestHuaweiPushTokenSync();
  return () => window.removeEventListener("float:huawei-token", onToken);
}
