const URL_BASE = 'https://dev.anthum.com/sleep.php'
const RESPONSE_DELAY = 2 // seconds
const NUM_REQUESTS = 1
let loads = 0

navigator.serviceWorker.register('/sw.js')

document.addEventListener('DOMContentLoaded', e => {
  document.querySelector('#reload').onclick = load
})

function load() {
  // loadSingle()
  loadMany()
}
load()

// HTTP is used to specifically create brower
async function loadMany() {
  const groupId = performance.now()
  const url = `${URL_BASE}?s=${RESPONSE_DELAY}&group=${++loads}#groupId=${groupId}`
  const promises = []
  for (let i=0; i < NUM_REQUESTS; i++) {
    promises.push(
      fetch(url)
        .catch(e => console.error('❌', e))
    )
  }

  const responses = await Promise.allSettled(promises).catch(e => {})
  console.log('✅ all settled', responses)
}

function loadSingle() {
  fetch(`${URL_BASE}?s=2#groupId=${performance.now()}`)
    .then(resp =>  console.log('✅', resp))
    .catch(e => console.error('❌', e.name))
}
