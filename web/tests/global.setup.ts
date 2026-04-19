import { execSync } from 'node:child_process'
import path from 'node:path'

async function globalSetup() {
  const apiDir = path.resolve(__dirname, '../../api')

  execSync('npx prisma migrate reset --force', {
    cwd: apiDir,
    stdio: 'inherit' as const,
  })
}

export default globalSetup
