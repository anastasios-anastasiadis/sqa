import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkStatus, describeMoment, expectedAnswer, judge, matchesWhen, type FrameResult } from '../src/checker.ts'
import type { Check } from '../src/types.ts'

const scrollbar: Check = {
  tag: 'scrollbar',
  line: 'From line 9 on, a scrollbar is visible in the box.',
  flow: 'chat-input',
  question: 'Is a scrollbar visible on the right edge of the box?',
  expect: [
    { when: { line: [1, 8] }, answer: 'no' },
    { when: { line: [9, 12] }, answer: 'yes' },
  ],
}

test('matchesWhen handles ranges, exact values and empty conditions', () => {
  assert.equal(matchesWhen({ line: [1, 8] }, { line: 8 }), true)
  assert.equal(matchesWhen({ line: [1, 8] }, { line: 9 }), false)
  assert.equal(matchesWhen({ line: [1, 8] }, { line: '3' }), false)
  assert.equal(matchesWhen({ dir: 'rtl' }, { dir: 'rtl', line: 2 }), true)
  assert.equal(matchesWhen({}, {}), true)
})

test('expectedAnswer follows expect, and skips "during" frames unless asked', () => {
  assert.equal(expectedAnswer(scrollbar, { line: 4 }, 'settled'), 'no')
  assert.equal(expectedAnswer(scrollbar, { line: 10 }, 'settled'), 'yes')
  assert.equal(expectedAnswer(scrollbar, { line: 13 }, 'settled'), undefined)
  assert.equal(expectedAnswer(scrollbar, { line: 10 }, 'during'), undefined)
  assert.equal(expectedAnswer({ ...scrollbar, frames: 'all' }, { line: 10 }, 'during'), 'yes')
})

test('judge trusts confident answers and marks the middle as unsure', () => {
  assert.equal(judge(0.92, 'yes'), 'pass')
  assert.equal(judge(0.08, 'yes'), 'fail')
  assert.equal(judge(0.05, 'no'), 'pass')
  assert.equal(judge(0.5, 'no'), 'unsure')
  assert.equal(judge(0.7, 'yes'), 'pass')
  assert.equal(judge(0.3, 'yes'), 'fail')
})

test('checkStatus: any fail fails, then unsure, then pass', () => {
  const frame = (verdict: FrameResult['verdict']): FrameResult => ({
    frameId: 0, step: 0, tags: {}, phase: 'settled', expected: 'yes', p: 0.5, verdict, image: '',
  })
  assert.equal(checkStatus([]), 'not-checked')
  assert.equal(checkStatus([frame('pass'), frame('unsure'), frame('fail')]), 'fail')
  assert.equal(checkStatus([frame('pass'), frame('unsure')]), 'unsure')
  assert.equal(checkStatus([frame('pass')]), 'pass')
})

test('describeMoment tells Jev which step the frame shows', () => {
  assert.equal(describeMoment({ line: 9 }, 'settled'), 'This frame was taken after this step finished: line = 9.')
  assert.match(describeMoment({}, 'settled'), /before the first step/)
})
