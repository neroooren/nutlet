import { getCSSVariablesRuleset, getThemeClassName, initTheme, NutletTheme, replaceThemeToken } from '../theme'

import { theme as themeFixture } from './theme.fixture'

let theme: NutletTheme
// @ts-expect-error safe to assign
const overwriteTheme: NutletTheme = { colors: { gray: '#EFEFEF', red: { 100: 'red', 200: 'red' } } }

beforeEach(() => {
  theme = { ...themeFixture }
  initTheme(theme)
  initTheme(overwriteTheme, theme)
})

afterEach(() => {
  delete overwriteTheme.$$nutlet
})

test('should init theme correctly', () => {
  expect(theme.$$nutlet).not.toBeUndefined()
  expect(theme).toMatchInlineSnapshot(`
    Object {
      "$$nutlet": Object {
        "className": "theme-n1k6b1",
        "parent": undefined,
      },
      "background": "$colors.gray",
      "colors": Object {
        "gray": "#EEEEEE",
        "white": "#FFFFFF",
      },
      "gap": Object {
        "s": 4,
        "xs": 2,
      },
      "radius": Object {
        "m": 6,
        "s": 4,
        "xs": 2,
      },
    }
  `)
})

test('should just init theme once', () => {
  expect(theme.$$nutlet).not.toBeUndefined()
  const $$nutlet = theme.$$nutlet
  initTheme(theme)
  expect($$nutlet).toBe(theme.$$nutlet)
})

test('should generate css variables ruleset correctly', () => {
  // @ts-expect-error smoking
  expect(getCSSVariablesRuleset(null)).toBe('')

  expect(getCSSVariablesRuleset(theme)).toMatchInlineSnapshot(
    `"--colors-white:#FFFFFF;--colors-gray:#EEEEEE;--gap-xs:2;--gap-s:4;--radius-xs:2;--radius-s:4;--radius-m:6;"`,
  )

  expect(getCSSVariablesRuleset(overwriteTheme)).toMatchInlineSnapshot(
    `"--colors-gray:#EFEFEF;--colors-red-100:red;--colors-red-200:red;"`,
  )
})

test('should inherit theme correctly', () => {
  expect(overwriteTheme.$$nutlet!.parent).not.toBeUndefined()
  expect(overwriteTheme).toMatchInlineSnapshot(`
    Object {
      "$$nutlet": Object {
        "className": "theme-n1hfd7",
        "parent": Object {
          "$$nutlet": Object {
            "className": "theme-n1k6b1",
            "parent": undefined,
          },
          "background": "$colors.gray",
          "colors": Object {
            "gray": "#EEEEEE",
            "white": "#FFFFFF",
          },
          "gap": Object {
            "s": 4,
            "xs": 2,
          },
          "radius": Object {
            "m": 6,
            "s": 4,
            "xs": 2,
          },
        },
      },
      "colors": Object {
        "gray": "#EFEFEF",
        "red": Object {
          "100": "red",
          "200": "red",
        },
      },
    }
  `)
})

test('should replace theme token correctly', () => {
  expect(replaceThemeToken(theme, '$colors.white')).toBe('var(--colors-white)')
  expect(replaceThemeToken(theme, '$gap.xs solid $colors.gray')).toBe('var(--gap-xs) solid var(--colors-gray)')
  expect(replaceThemeToken(theme, '$background')).toBe('var(--colors-gray)')
  expect(replaceThemeToken(overwriteTheme, '$background')).toBe('var(--colors-gray)')

  expect(() => replaceThemeToken(theme, '$colors')).toThrowError('Expect String or Number')
  expect(() => replaceThemeToken(theme, '$missing.path')).toThrowError('No theme variable defined')
  expect(() => replaceThemeToken(overwriteTheme, '$missing.path')).toThrowError('No theme variable defined')
})

test('should get className correctly', () => {
  expect(getThemeClassName(theme)).toBe('theme-n1k6b1')
  expect(getThemeClassName(overwriteTheme)).toBe('theme-n1k6b1 theme-n1hfd7')
})
