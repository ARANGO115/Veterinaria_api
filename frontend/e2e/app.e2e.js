import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Builder, Browser } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import DashboardPage from './pages/DashboardPage.js'
import LoginPage from './pages/LoginPage.js'

const frontendDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const viteCli = path.join(frontendDirectory, 'node_modules', 'vite', 'bin', 'vite.js')
const host = '127.0.0.1'
const port = 5173
const baseUrl = `http://${host}:${port}`
const server = spawn(
  process.execPath,
  [viteCli, '--host', host, '--port', String(port), '--strictPort'],
  { cwd: frontendDirectory, stdio: 'inherit' },
)

let serverExited = false
server.once('exit', () => {
  serverExited = true
})

async function waitForServer() {
  const deadline = Date.now() + 30000

  while (Date.now() < deadline) {
    if (serverExited) {
      throw new Error('Vite exited before becoming ready.')
    }

    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    } catch {
      await delay(250)
    }
  }

  throw new Error(`Vite did not become ready at ${baseUrl}.`)
}

async function stopServer() {
  if (server.exitCode !== null || server.signalCode !== null) return

  server.kill()
  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    delay(5000),
  ])
}

const results = []
let driver

try {
  await waitForServer()

  const options = new chrome.Options().addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
  )
  driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build()

  await driver.manage().setTimeouts({ pageLoad: 30000, implicit: 0 })
  const loginPage = new LoginPage(driver, baseUrl)
  const dashboardPage = new DashboardPage(driver, baseUrl)

  const tests = [
    {
      name: 'Login muestra encabezado y descripción',
      run: async () => {
        await loginPage.open()
        assert.equal(await loginPage.getHeading(), 'Iniciar sesión')
        assert.equal(
          await loginPage.getDescription(),
          'Ruta pública para autenticarse en la plataforma.',
        )
      },
    },
    {
      name: 'Dashboard sin token redirige a Login',
      run: async () => {
        await loginPage.open()
        await driver.executeScript('window.localStorage.clear()')
        await dashboardPage.open()
        assert.equal(new URL(await driver.getCurrentUrl()).pathname, '/login')
        assert.equal(await loginPage.getHeading(), 'Iniciar sesión')
      },
    },
    {
      name: 'Dashboard con token sintético permite el acceso',
      run: async () => {
        await loginPage.open()
        await driver.executeScript(
          'window.localStorage.setItem("token", "e2e-test-token")',
        )
        await dashboardPage.open()
        assert.equal(
          new URL(await driver.getCurrentUrl()).pathname,
          '/dashboard',
        )
        assert.equal(await dashboardPage.getHeading(), 'Panel principal')
      },
    },
  ]

  for (const test of tests) {
    try {
      await test.run()
      results.push({ name: test.name, passed: true })
      console.log(`PASS ${test.name}`)
    } catch (error) {
      results.push({ name: test.name, passed: false })
      console.error(`FAIL ${test.name}: ${error.message}`)
    }
  }
} catch (error) {
  console.error(`E2E setup failed: ${error.message}`)
  process.exitCode = 1
} finally {
  if (driver) {
    try {
      await driver.quit()
    } catch (error) {
      console.error(`Failed to close WebDriver: ${error.message}`)
      process.exitCode = 1
    }
  }

  await stopServer()
}

if (results.length > 0) {
  const passed = results.filter((result) => result.passed).length
  const failed = results.length - passed
  console.log(`E2E results: ${passed} passed, ${failed} failed.`)
  if (failed > 0) process.exitCode = 1
}
