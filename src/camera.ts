import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CDPSession, Page } from 'playwright'
import { pngSize } from './image.ts'
import type { Frame, Phase, Tags } from './types.ts'

/**
 * Records a frame every time the screen changes (Chrome's screencast), plus one
 * key frame after each step settles. Each frame is labelled with the step that
 * was running when it arrived.
 */
export class Camera {
  readonly frames: Frame[] = []
  private cdp?: CDPSession
  private writes: Promise<void>[] = []
  private state: { step: number; tags: Tags; phase: Phase } = { step: -1, tags: {}, phase: 'settled' }

  constructor(
    private readonly page: Page,
    private readonly dir: string,
    private readonly prefix: string,
  ) {}

  async start(): Promise<void> {
    this.cdp = await this.page.context().newCDPSession(this.page)
    this.cdp.on('Page.screencastFrame', (event) => {
      void this.cdp?.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {})
      const data = Buffer.from(event.data, 'base64')
      const { width } = pngSize(data)
      this.save(data, width / event.metadata.deviceWidth, event.metadata.offsetTop)
    })
    await this.cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 })
  }

  setState(step: number, tags: Tags, phase: Phase): void {
    this.state = { step, tags, phase }
  }

  async keyFrame(): Promise<void> {
    const data = await this.page.screenshot()
    const viewport = this.page.viewportSize()
    const { width } = pngSize(data)
    this.save(data, viewport ? width / viewport.width : 1, 0)
  }

  async stop(): Promise<void> {
    await this.cdp?.send('Page.stopScreencast').catch(() => {})
    await this.cdp?.detach().catch(() => {})
    await Promise.all(this.writes)
  }

  private save(data: Buffer, scale: number, offsetTop: number): void {
    const id = this.frames.length
    const file = join(this.dir, `${this.prefix}-${String(id).padStart(5, '0')}.png`)
    this.frames.push({ id, file, ...this.state, scale, offsetTop })
    this.writes.push(writeFile(file, data))
  }
}
