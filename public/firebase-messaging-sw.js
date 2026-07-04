importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Config values are safe to inline here (not secrets, see .env.example) —
// a service worker can't read import.meta.env, so this file can't share
// the app's config source and must hardcode it.
firebase.initializeApp({
  apiKey: 'AIzaSyAOu_QEm0s7sy6YJ0J9miMABPkHkCik_ro',
  authDomain: 'cente-leads.firebaseapp.com',
  projectId: 'cente-leads',
  storageBucket: 'cente-leads.firebasestorage.app',
  messagingSenderId: '506178632876',
  appId: '1:506178632876:web:1c615182932b2389ea3309',
});

const messaging = firebase.messaging();

console.log('[push:sw] service worker loaded and firebase.messaging() initialized');

// Background messages (tab not focused / browser minimized) land here;
// foreground messages are instead handled by onMessage() in notifications.ts.
messaging.onBackgroundMessage((payload) => {
  console.log('[push:sw] onBackgroundMessage fired, payload =', payload);
  const { title, body } = payload.notification ?? {};
  self.registration.showNotification(title ?? 'Cente Leads', {
    body,
    icon: '/cente-leads-icon.png',
    data: payload.data ?? {},
  });
});

// Routes a clicked notification to the related lead, mirroring
// cente-leads-mobile's src/domains/notifications/handlers.ts.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { related_entity_type: relatedEntityType, related_entity_id: relatedEntityId } =
    event.notification.data ?? {};
  const url = relatedEntityType === 'lead' && relatedEntityId ? `/leads/${relatedEntityId}` : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
