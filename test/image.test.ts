import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import sharp from 'sharp'
import { cropForJev, cropRect, fitSize, JEV_MAX_SIDE, JEV_MIN_SIDE, pngSize } from '../src/image.ts'

const viewport = { width: 1280, height: 800 }

test('cropRect widens a small element to at least 280 px, centred on it', () => {
  const rect = cropRect({ x: 400, y: 600, width: 600, height: 40 }, viewport, 1, 0)
  assert.equal(rect.width, 632)
  assert.equal(rect.height, JEV_MIN_SIDE)
  assert.equal(rect.left, 384)
  // Centred: 600 + 20 (middle of the box) - 140
  assert.equal(rect.top, 480)
})

test('cropRect stays inside the image near an edge', () => {
  const rect = cropRect({ x: 1200, y: 760, width: 60, height: 30 }, viewport, 1, 0)
  assert.equal(rect.left + rect.width, viewport.width)
  assert.equal(rect.top + rect.height, viewport.height)
})

test('cropRect uses image pixels when the screen is scaled', () => {
  const rect = cropRect({ x: 100, y: 100, width: 300, height: 300 }, { width: 2560, height: 1600 }, 2, 0)
  assert.deepEqual(rect, { left: 168, top: 168, width: 664, height: 664 })
})

test('cropRect without a box returns the whole image', () => {
  assert.deepEqual(cropRect(null, viewport, 1, 0), { left: 0, top: 0, width: 1280, height: 800 })
})

test('fitSize keeps both sides within Jev limits', () => {
  assert.deepEqual(fitSize(632, 280), { width: 632, height: 280 })
  assert.deepEqual(fitSize(2560, 1600), { width: JEV_MAX_SIDE, height: 980 })
  assert.deepEqual(fitSize(200, 100), { width: 560, height: 280 })
})

test('cropForJev returns a valid PNG and the same hash for the same pixels', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'sqa-test-'))
  const file = join(dir, 'frame.png')
  const png = await sharp({ create: { width: 1280, height: 800, channels: 3, background: '#3366cc' } }).png().toBuffer()
  writeFileSync(file, png)

  const rect = cropRect({ x: 400, y: 600, width: 600, height: 40 }, viewport, 1, 0)
  const a = await cropForJev(file, rect)
  const b = await cropForJev(file, rect)
  assert.deepEqual(pngSize(a.png), { width: 632, height: 280 })
  assert.equal(a.hash, b.hash)

  // A very long, thin strip is resized down to 1568 wide, then padded to 280 tall.
  const wide = await sharp({ create: { width: 4000, height: 300, channels: 3, background: '#ffffff' } }).png().toBuffer()
  writeFileSync(file, wide)
  const strip = await cropForJev(file, { left: 0, top: 0, width: 4000, height: 300 })
  assert.deepEqual(pngSize(strip.png), { width: JEV_MAX_SIDE, height: JEV_MIN_SIDE })
})
