importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

// The app registers this worker with its Firebase config base64-encoded in
// the query string, so no config ever needs to be hardcoded here.
function readConfig() {
  try {
    const params = new URLSearchParams(self.location.search);
    const encoded = params.get('config');
    if (!encoded) return null;
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

const config = readConfig();
if (config) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const data = payload?.data ?? {};
    const title = data.title || 'JobPilot';
    const options = {
      body: data.body || 'You have a new notification.',
      icon: '/jobpilot-192.png',
      tag: data.tag || `jobpilot-${data.title || 'msg'}`,
      renotify: true,
      data,
    };

    self.registration.showNotification(title, options);
  });
}
