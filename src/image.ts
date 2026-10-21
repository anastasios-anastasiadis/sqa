import { createHash } from 'node:crypto'
import sharp from 'sharp'
import type { Box } from './types.ts'

/** Jev rejects images outside 280–1568 px per side instead of resizing them. */
export const JEV_MIN_SIDE = 280
export const JEV_MAX_SIDE = 1568

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

export function pngSize(data: Buffer): { width: number; height: number } {
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
}

/**
 * Turns an element's CSS box into an image rectangle around it. Small elements are
 * widened with surrounding page, not padding, so Jev sees real context. Jev misses
 * small targets in large images, so the element should fill most of the crop.
 */
export function cropRect(
  box: Box | null,
  image: { width: number; height: number },
  scale: number,
  offsetTop: number,
  margin = 16,
): Rect {
  if (!box) return { left: 0, top: 0, width: image.width, height: image.height }

  const grow = (start: number, size: number, limit: number): [number, number] => {
    if (size < JEV_MIN_SIDE) {
      start -= (JEV_MIN_SIDE - size) / 2
      size = JEV_MIN_SIDE
    }
    if (size >= limit) return [0, limit]
    start = Math.min(Math.max(start, 0), limit - size)
    return [Math.round(start), Math.round(size)]
  }

  const [left, width] = grow((box.x - margin) * scale, (box.width + 2 * margin) * scale, image.width)
  const [top, height] = grow((box.y + offsetTop - margin) * scale, (box.height + 2 * margin) * scale, image.height)
  return { left, top, width, height }
}

/** The size to resize to so both sides fit Jev's limits. */
export function fitSize(width: number, height: number): { width: number; height: number } {
  let scale = 1
  if (Math.min(width, height) < JEV_MIN_SIDE) scale = JEV_MIN_SIDE / Math.min(width, height)
  if (Math.max(width, height) * scale > JEV_MAX_SIDE) scale = JEV_MAX_SIDE / Math.max(width, height)
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

/** Crops a frame and returns a PNG Jev accepts, plus a hash of its pixels for skipping repeats. */
export async function cropForJev(file: string, rect: Rect): Promise<{ png: Buffer; hash: string }> {
  const size = fitSize(rect.width, rect.height)
  let image = sharp(file).extract(rect)
  if (size.width !== rect.width || size.height !== rect.height) image = image.resize(size)

  // Only very long, thin crops still fall short after resizing. Pad those with white.
  const padRight = Math.max(0, JEV_MIN_SIDE - size.width)
  const padBottom = Math.max(0, JEV_MIN_SIDE - size.height)
  if (padRight || padBottom) {
    const resized = await image.png().toBuffer()
    image = sharp(resized).extend({ right: padRight, bottom: padBottom, background: '#ffffff' })
  }

  const png = await image.png().toBuffer()
  const { data } = await sharp(png).raw().toBuffer({ resolveWithObject: true })
  return { png, hash: createHash('sha1').update(data).digest('hex') }
}
