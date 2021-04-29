import hash from '@emotion/hash'

import { Expect } from './types'

const { create, assign, keys, entries } = Object

export { create, assign, keys, entries }

export const isBrowser = typeof window !== 'undefined' && typeof window.navigator !== 'undefined'

export function splitObject<P, G extends string>(
  obj: P,
  groupBy: (key: keyof P, val: P[typeof key]) => G | true | false,
): Expect<P, { [key in G]?: { [key in keyof P]?: P[key] } }> {
  if (!obj) {
    throw new Error('The object to be splitted must not be nullish.')
  }

  return entries(obj).reduce((groups, [key, val]) => {
    const group = groupBy(key as keyof P, val)
    if (groups[group]) {
      groups[group][key] = val
    } else {
      groups[group] = { [key]: val }
    }

    return groups
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as any)
}

export function omit<P, T extends keyof NonNullable<P>>(obj: P, ...keys: T[]): Omit<P, T> {
  if (!obj) {
    return obj
  }

  // @ts-expect-error `splitObject` won't assure all possible banches are nullish
  return splitObject(obj, (key) => keys.includes(key as T)).false ?? {}
}

export function memoize<R>(func: (input: string) => R): { (input: string): R; cache: Map<string, R> } {
  const memoized = function memoizedFunc(this: unknown, input: string) {
    const cache = memoized.cache
    if (cache.has(input)) {
      return cache.get(input)!
    }

    const result = func.call(this, input)
    cache.set(input, result)
    return result
  }
  memoized.cache = new Map<string, R>()

  return memoized
}

export const hashString = memoize((input: string) => {
  return ('n' + hash(input)).substr(0, 6)
})

export function get(obj: unknown, path: string): unknown {
  if (!obj) {
    return undefined
  }

  if (!path) {
    return obj
  }

  return path.split('.').reduce((o, key) => {
    // @ts-expect-error object is unknown
    return o?.[key]
  }, obj)
}
