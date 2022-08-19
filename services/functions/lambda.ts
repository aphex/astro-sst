import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
//@ts-ignore
import { handler as ssrHandler } from '../../web/dist/server/entry.mjs'

export const handler: APIGatewayProxyHandlerV2 = async (event) => ssrHandler(event)
