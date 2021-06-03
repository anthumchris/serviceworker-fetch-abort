/*  Service Worker for aborting HTTP requests by invalid request groups
 *
 *  Use Case: cancel queued and in-flight HTTP requests when users issue
 *  "reload" or navigation requests.  This avoids race conditions and can free up
 *  busy sockets for non-HTTP/2 connections (Chrome only keeps 6 open).
 *
 *  Solution: Certain requests will contain a "groupId" and will be intercepted
 *  and re-issued with an AbortController.  Only one valid groupId may exist.
 *  When a new groupId is detected, all requests are aborted for other groupIds.
 *
 *  CRITICAL TODO: add "invalid groupId" list to handle "late" requests
 *  instantiated after invalidation
 */

// maintain list of AbortControllers, grouped by groupId
let requestGroupControllers = {}


self.addEventListener('install', e => {
  console.log('SW installed')
  
  // activate updated SW immediately (page refresh required)
  self.skipWaiting()
})


self.addEventListener('activate', e => {
  console.log('SW activated, please refresh page.')
})


self.addEventListener('fetch', initAbortableRequest)


function initAbortableRequest(event) {
  const request = event.request
  const requestGroupId = getRequestGroupId(request)

  // Ignore all requests we're not controlling
  if (!requestGroupId) 
    return

  // atttach AbortController and execute request immediately
  const controller = new AbortController()
  const signal = controller.signal
  event.respondWith(
    fetch(request, { signal })
      .catch(e => {}) // prevent uncaught error message in console
      .finally(() => removeAbortController(requestGroupId, controller))
  )

  // add controller to beginning of queue for thread-safe reverse FIFO scan
  if (!requestGroupControllers[requestGroupId]) {
    requestGroupControllers[requestGroupId] = []
  }
  requestGroupControllers[requestGroupId].unshift(controller)

  // if requestGroupId is new, abort requests for other groups
  for (let id of Object.keys(requestGroupControllers)) {
    if (id !== requestGroupId) {
      requestGroupControllers[id].forEach(o => o.abort())
    }
  }
}


/*  This demo passes groupId in URL hash (which isn't sent to server)
 *  Other implemtations could pass the id via request params or headers that the SW 
 */
function getRequestGroupId(request) {
  return new URLSearchParams(
    new URL(request.url).hash.substring(1) // remove #
  ).get('groupId')
}


// this should only be called when a fetch() settles (success or fail)
function removeAbortController(groupId, controller) {
  const controllers = requestGroupControllers[groupId]
  for (let i=0; i < controllers?.length; i++) {
    if (controllers[i] === controller) {
      return controllers.splice(i, 1)
    }
  }
}
