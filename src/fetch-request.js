import * as globalHeaders from './global-res-headers'

const headerWhitelist = new Set([
  'connection',
  'content-disposition',
  'content-type',
  'content-length',
  'cf-polished',
  'date',
  'status',
  'transfer-encoding'
])

export async function fetchRequest(event, { originReq }) {
  // const originRes = await fetch(originReq)

  // console.log(
  //   'req',
  //   originReq.url,
  //   Object.fromEntries(originReq.headers.entries())
  // )

  const originRes = await fetch(originReq, {
    cf: {
      polish: 'lossy',
      cacheEverything: true
    }
  })

  // Construct a new response so we can mutate its headers
  const res = new Response(originRes.body, originRes)
  // console.log('res0', res.status, Object.fromEntries(res.headers.entries()))

  // Stripe additional headers from the response that may impact cacheability
  // like content security policy stuff
  normalizeResponseHeaders(res)

  // Override cache-control
  res.headers.set(
    'cache-control',
    'public, immutable, s-maxage=31536000, max-age=31536000, stale-while-revalidate=60'
  )

  // Set CORS headers
  for (const header of globalHeaders.globalResHeadersKeys) {
    res.headers.set(header, globalHeaders.globalResHeaders[header])
  }

  // console.log('res1', res.status, Object.fromEntries(res.headers.entries()))
  return res
}

function normalizeResponseHeaders(res) {
  const headers = Object.fromEntries(res.headers.entries())
  const keys = Object.keys(headers)

  for (const key of keys) {
    if (!headerWhitelist.has(key)) {
      res.headers.delete(key)
    }
  }

  return res
}
