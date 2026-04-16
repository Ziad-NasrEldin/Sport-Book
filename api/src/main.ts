import { createApp } from './app'
import { env } from '@config/env'

async function main() {
  const app = await createApp()

  try {
    await app.listen({ port: parseInt(env.PORT), host: env.HOST })
    app.log.info(`Server running at http://${env.HOST}:${env.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()
