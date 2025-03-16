importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js")

const { workbox } = self

self.__WB_MANIFEST

const fileExtensionRegexp = /\/[^/?]+\.[^/]+$/
workbox.routing.registerRoute(

  ({ request, url }) => {
    if (request.mode !== "navigate") {
      return false
    }


    if (url.pathname.startsWith("/_")) {
      return false
    }

    if (url.pathname.match(fileExtensionRegexp)) {
      return false
    }
    return true
  },
  workbox.strategies.networkFirst({
    cacheName: "pages",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, 
      }),
    ],
  }),
)

workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets",
  }),
)

workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new workbox.strategies.CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  }),
)

workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  new workbox.strategies.CacheFirst({
    cacheName: "images",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, 
      }),
    ],
  }),
)

workbox.routing.registerRoute(
  /\.(?:js|css)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "static-resources",
  }),
)

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})


