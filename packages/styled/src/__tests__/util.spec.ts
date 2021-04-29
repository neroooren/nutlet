/* eslint-disable @typescript-eslint/naming-convention */
import { stub } from 'sinon'

import { get, isBrowser, memoize, omit, splitObject } from '../util'

import { theme } from './theme.fixture'

test('should split object correctly', () => {
  expect(
    splitObject(
      // prettier-ignore
      { a: 1, b: 2, c: 3, A: 1, B: 2, C: 3 },
      (key) => (key.charCodeAt(0) < 97 ? 'uppercase' : 'lowercase'),
    ),
  ).toEqual({
    lowercase: { a: 1, b: 2, c: 3 },
    uppercase: { A: 1, B: 2, C: 3 },
  })

  expect(
    splitObject(
      // prettier-ignore
      { a: 1, b: 2, c: 3, A: 1, B: 2, C: 3 },
      (_, val) => val % 2 === 0,
    ),
  ).toEqual({
    true: { b: 2, B: 2 },
    false: { a: 1, A: 1, c: 3, C: 3 },
  })

  expect(() => splitObject(null, () => true)).toThrow('The object to be splitted must not be nullish.')
})

test('should omit object fields correctly', () => {
  expect(omit({ a: 1 }, 'a')).toEqual({})
  expect(omit(null)).toBe(null)
  expect(omit({ a: 1, b: 2 }, 'a')).toEqual({ b: 2 })
  expect(omit({ a: 1, b: 2, c: 3 }, 'a', 'c')).toEqual({ b: 2 })
})

test('should correctly detect browser environment', () => {
  expect(isBrowser).toBeFalsy()
})

test('should memoize function calls', () => {
  const fakeFn = stub()
  fakeFn.returns('output')
  const f = memoize((input) => fakeFn(input))

  const output1 = f('input')
  const output2 = f('input')

  expect(fakeFn.calledOnceWith('input')).toBeTruthy()
  expect(output1).toBe('output')
  expect(output2).toBe('output')

  fakeFn.returns('another output')
  const output3 = f('another input')
  expect(fakeFn.calledTwice).toBeTruthy()
  expect(fakeFn.args).toEqual([['input'], ['another input']])
  expect(output3).toBe('another output')
})

test('should get correct property from object', () => {
  expect(get(theme, 'colors')).toEqual({ white: '#FFFFFF', gray: '#EEEEEE' })
  expect(get(theme, 'colors.gray')).toBe('#EEEEEE')
  expect(get(theme, 'gap.xs')).toBe(2)
  expect(get(null, 'gap.xs')).toBe(undefined)
  expect(get(theme, '')).toBe(theme)
})
