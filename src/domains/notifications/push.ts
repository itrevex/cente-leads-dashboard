// Browser push registration (Web Push via FCM), the dashboard counterpart
// to cente-leads-mobile's src/domains/notifications/register.ts — same
// DeviceToken backend, "web" platform instead of "ios"/"android".
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

async function registerDeviceToken(token: string): Promise<void> {
  await fetch('/api/device-tokens/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform: 'web' }),
  });
}

// Browser permission state (granted/denied) already persists once the user
// answers the real prompt — but this flag remembers "we've already asked,"
// so a user who dismissed the prompt without answering (Escape, clicking
// away) isn't re-prompted on every subsequent page load.
const ASKED_STORAGE_KEY = 'cente-leads:push-permission-asked';

/** Requests notification permission and registers the resulting FCM token.
 * No-ops on unsupported browsers (Safari <16, or non-HTTPS/non-localhost
 * origins where the Push API isn't available), if permission is denied,
 * and after the first ask this session/browser (see ASKED_STORAGE_KEY). */
export async function registerForPushNotifications(): Promise<void> {
  console.log('[push] registerForPushNotifications start');
  if (!(await isSupported())) {
    console.log('[push] isSupported() is false, aborting');
    return;
  }
  if (typeof Notification === 'undefined') {
    console.log('[push] Notification API unavailable, aborting');
    return;
  }

  let permission = Notification.permission;
  console.log('[push] current permission =', permission);
  if (permission === 'default' && !localStorage.getItem(ASKED_STORAGE_KEY)) {
    localStorage.setItem(ASKED_STORAGE_KEY, 'true');
    permission = await Notification.requestPermission();
    console.log('[push] requested permission, result =', permission);
  }
  if (permission !== 'granted') {
    console.log('[push] permission not granted, aborting');
    return;
  }

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  console.log('[push] service worker registered, scope =', registration.scope);
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  console.log('[push] fcm token =', token);
  if (!token) {
    console.log('[push] no token returned, aborting');
    return;
  }

  await registerDeviceToken(token);
  console.log('[push] registered token with backend');

  // Foreground messages don't trigger the service worker's push event (per
  // FCM's web SDK design), so they need an explicit foreground handler —
  // otherwise a notification would silently vanish while the tab is open.
  onMessage(messaging, (payload) => {
    console.log('[push] onMessage fired, payload =', payload);
    const { title, body } = payload.notification ?? {};
    if (!title) {
      console.log('[push] no notification.title in payload, not showing');
      return;
    }
    new Notification(title, { body, icon: '/cente-leads-icon.png' });
    console.log('[push] Notification() shown');
  });
  console.log('[push] onMessage listener attached');
}
