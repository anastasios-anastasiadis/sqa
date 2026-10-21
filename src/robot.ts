import type { Page } from 'playwright'
import type { Camera } from './camera.ts'
import type { Box, Sqa, StepRecord, Tags } from './types.ts'

/** The `sqa` object flows receive. It labels frames and records where crop elements are. */
export class Robot implements Sqa {
  readonly steps: StepRecord[] = []

  constructor(
    private readonly page: Page,
    private readonly camera: Camera,
    private readonly cropSelectors: string[],
    private readonly settleMs: number,
  ) {}

  async step(tags: Tags, action?: () => Promise<unknown>): Promise<void> {
    const index = this.steps.length
    this.camera.setState(index, tags, 'during')
    if (action) await action()
    await this.settle()
    const boxes = await this.measure()
    this.steps.push({ index, tags, boxes })
    this.camera.setState(index, tags, 'settled')
    await this.camera.keyFrame()
  }

  private async settle(): Promise<void> {
    await this.page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    )
    await this.page.waitForTimeout(this.settleMs)
  }

  private async measure(): Promise<Record<string, Box | null>> {
    const boxes: Record<string, Box | null> = {}
    for (const selector of this.cropSelectors) {
      boxes[selector] = await this.page
        .locator(selector)
        .first()
        .boundingBox({ timeout: 1000 })
        .catch(() => null)
    }
    return boxes
  }
}
