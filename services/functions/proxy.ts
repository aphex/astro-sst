import { readFile } from 'fs/promises'
import { contentType } from 'mime-types'
import { join, dirname } from 'path'
import { findUp } from 'find-up'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

const root = await findUp('sst.json')

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const { pathParameters } = event
  let { proxy } = pathParameters || {}
  const isFavIcon = event.rawPath.toLowerCase() === '/favicon.ico'

  if (isFavIcon) {
    proxy = 'favicon.ico'
  }

  if (!proxy || !root) return { statusCode: 404, body: 'Not found' }

  const type = contentType(proxy)
  const body = await readFile(join(dirname(root), 'web', 'dist', 'client', !isFavIcon ? 'assets' : '', proxy))
  return {
    statusCode: 200,
    headers: {
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      'content-type': type,
    },
    body: body.toString(),
  }
}
