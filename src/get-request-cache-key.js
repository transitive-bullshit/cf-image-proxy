import { normalizeUrl } from './normalize-url'

export async function getRequestCacheKey(request) {
  try {
    // Respect "pragma: no-cache" header
    const pragma = request.headers.get('pragma')
    if (pragma === 'no-cache') {
      return null
    }

    // Only cache readonly requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return null
    }

    // Respect "cache-control" header directives
    const cacheControl = request.headers.get('cache-control')
    if (cacheControl) {
      const directives = new Set(cacheControl.split(',').map((s) => s.trim()))
      if (directives.has('no-store') || directives.has('no-cache')) {
        return null
      }
    }

    const url = request.url
    const normalizedUrl = normalizeUrl(url)

    if (url !== normalizedUrl) {
      return normalizeRequestHeaders(
        new Request(normalizedUrl, { method: request.method })
      )
    }

    return normalizeRequestHeaders(new Request(request))
  } catch (err) {
    console.error('error computing cache key', request.method, request.url, err)
    return null
  }
}

const requestHeaderWhitelist = new Set([
  'cache-control',
  'accept',
  'accept-encoding',
  'accept-language',
  'user-agent'
])

function normalizeRequestHeaders(request) {
  const headers = Object.fromEntries(request.headers.entries())
  const keys = Object.keys(headers)

  for (const key of keys) {
    if (!requestHeaderWhitelist.has(key)) {
      request.headers.delete(key)
    }
  }

  return request
}
