// Signs in to S staging with the test account in targets/s/.env and saves the
// session to targets/s/.auth/state.json for `sqa check`.
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const BASE_URL = 'https://staging.s.norma.app'
const AUTH_HOST = 'auth.staging.s.norma.app'
const SESSION_KEY = 'workspace-web.session'

const email = process.env.S_EMAIL
const password = process.env.S_PASSWORD
if (!email || !password) throw new Error('Set S_EMAIL and S_PASSWORD in targets/s/.env')

const authDir = fileURLToPath(new URL('./.auth/', import.meta.url))
mkdirSync(authDir, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await context.newPage()
const submit = () => page.getByRole('button', { name: /^(continue|next|sign in|log in)$/i }).first().click()

try {
  await page.goto(BASE_URL)
  const signIn = page.getByRole('button', { name: 'Sign in' })
  await Promise.race([
    page.waitForURL((url) => url.hostname === AUTH_HOST, { timeout: 30_000 }),
    signIn.waitFor({ timeout: 30_000 }).then(() => signIn.click()),
  ])
  await page.waitForURL((url) => url.hostname === AUTH_HOST, { timeout: 30_000 })

  await page.locator('input[name="loginName"], input[type="email"], input[type="text"]').first().fill(email)
  await submit()
  await page.locator('input[type="password"]').fill(password)
  await submit()

  // Zitadel may offer optional steps such as setting up 2-factor. Skip them.
  const back = page.waitForURL((url) => url.hostname === new URL(BASE_URL).hostname, { timeout: 60_000 })
  const skip = page.getByRole('button', { name: /^skip$/i })
  await Promise.race([back, skip.waitFor({ timeout: 60_000 }).then(() => skip.click()).then(() => back)])

  await page.waitForFunction((key) => localStorage.getItem(key) !== null, SESSION_KEY, { timeout: 30_000 })
  await context.storageState({ path: `${authDir}state.json` })
  console.log('Signed in. Session saved to targets/s/.auth/state.json')
} catch (error) {
  const shot = `${authDir}login-failure.png`
  await page.screenshot({ path: shot }).catch(() => {})
  console.error(`Sign-in failed at ${page.url()}: ${(error as Error).message}\nScreenshot: ${shot}`)
  process.exitCode = 1
} finally {
  await browser.close()
}
