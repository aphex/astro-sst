import { defineConfig } from 'astro/config'
import awsAdapter from 'astro-lambda-adapter'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: awsAdapter(),
})
