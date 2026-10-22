import type { Flow } from '../../../src/index.ts'

// Any S dashboard works. Its header has the "Schedule report" button.
const DASHBOARD_PATH = '/home/workspaces/default/apps/crm/dashboards/norma-product-performance'

const flow: Flow = async ({ page, sqa }) => {
  if (DASHBOARD_PATH.includes('REPLACE-ME')) {
    throw new Error('Set DASHBOARD_PATH in targets/s/flows/timezone-search.ts to an S dashboard.')
  }
  await page.goto(DASHBOARD_PATH)
  await page.getByRole('button', { name: 'Schedule report' }).click()
  await page.locator('#scheduled-report-timezone').click()

  await sqa.step({ query: '' })
  await sqa.step({ query: 'dubai' }, () =>
    page.getByPlaceholder('Search timezones').pressSequentially('dubai', { delay: 50 }),
  )
}

export default flow
