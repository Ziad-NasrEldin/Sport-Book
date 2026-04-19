import { execSync, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

execSync(
  `powershell -NoProfile -Command "$ErrorActionPreference = 'SilentlyContinue'; Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and ($_.CommandLine -match 'E:\\\\GitHub\\\\Sport-Book\\\\web' -or $_.CommandLine -match 'E:\\\\GitHub\\\\Sport-Book\\\\api') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`,
  {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true,
  },
)

const result =
  process.platform === 'win32'
    ? spawnSync(
        'cmd.exe',
        ['/d', '/s', '/c', `npx playwright test ${process.argv.slice(2).join(' ')}`.trim()],
        {
          cwd: path.resolve(repoRoot, 'web'),
          stdio: 'inherit',
          shell: false,
        },
      )
    : spawnSync('npx', ['playwright', 'test', ...process.argv.slice(2)], {
        cwd: path.resolve(repoRoot, 'web'),
        stdio: 'inherit',
        shell: false,
      })

if (result.error) {
  console.error(result.error)
}

if (result.signal) {
  console.error(`Playwright terminated with signal: ${result.signal}`)
}

if (typeof result.status !== 'number') {
  console.error('Playwright exited without a numeric status code.')
}

process.exit(result.status ?? 1)
