//Web Push Notifications//
let click_open_url
self.addEventListener('push', function(event) {
  let push_message = event.data.json()
  console.log(push_message, "EVENT")
  // push notification can send event.data.json() as well
  click_open_url = 'https://www.curve.fi/ren/gateway'
  const options = {
    body: push_message.tx,
  };
  event.waitUntil(self.registration.showNotification("Transaction received", options));
});

self.addEventListener('notificationclick', function(event) {
  const clickedNotification = event.notification;
  clickedNotification.close();
  if ( click_open_url ){
    const promiseChain = clients.openWindow(click_open_url);
    event.waitUntil(promiseChain);
  }
});
