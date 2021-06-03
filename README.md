# serviceworker-fetch-abort

This test/exmple shows how to abort fetch requests in a Service Worker by passing a new `groupId` in the URL.  Useful for cancelling a large number of requests that are either queued in the browser or already in-flight

# Usage

1. `python3 -m http.server`
1. http://localhost:8000/
1. Open browser network inspector and console
1. Click "Reload" before requests finish to make Service Worker abort the in-flight requests.
