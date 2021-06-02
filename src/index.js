import { fetchCache } from './fetch-cache'
import { getRequestCacheKey } from './get-request-cache-key'
import { handleOptions } from './handle-options'
import { fetchRequest } from './fetch-request'
import { resolveRequest } from './resolve-request'
import { globalResHeaders } from './global-res-headers'

addEventListener('fetch', (event) => {
	event.respondWith(handleFetchEvent(event))
})

/**
 * @param {*} event
 */
async function handleFetchEvent(event) {
	const gatewayStartTime = Date.now()
	let gatewayTimespan
	let res

	function recordTimespans() {
		const now = Date.now()
		gatewayTimespan = now - gatewayStartTime
	}

	try {
		const { request } = event
		const { method } = request

		if (method === 'OPTIONS') {
			return handleOptions(request)
		}

		const { originReq } = await resolveRequest(event, request)

		try {
			const cacheKey = await getRequestCacheKey(originReq)
			const originRes = await fetchCache({
				event,
				cacheKey,
				fetch: () => fetchRequest(event, { originReq })
			})

			res = new Response(originRes.body, originRes)
			recordTimespans()

			res.headers.set('x-proxy-response-time', `${gatewayTimespan}ms`)

			return res
		} catch (err) {
			console.error(err)
			recordTimespans()

			res = new Response(
				JSON.stringify({
					error: err.message,
					type: err.type,
					code: err.code
				}),
				{ status: 500, headers: globalResHeaders }
			)

			return res
		}
	} catch (err) {
		console.error(err)

		if (err.response) {
			// TODO: make sure this response also has CORS globalResHeaders
			return err.response
		} else {
			return new Response(
				JSON.stringify({
					error: err.message,
					type: err.type,
					code: err.code
				}),
				{
					status: 500,
					headers: globalResHeaders
				}
			)
		}
	}
}
