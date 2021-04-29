import { getCSSVariablesRuleset, initTheme, replaceThemeToken, Theme } from '../theme'

import { theme as themeFixture } from './theme.fixture'

let theme: Theme

beforeEach(() => {
  theme = { ...themeFixture }
  initTheme(theme)
})

test('should init theme correctly', () => {
  // @ts-expect-error exists after `initTheme`
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

test('should generate css variables ruleset correctly', () => {
  const overwriteTheme: Theme = { colors: { gray: '#EFEFEF' } }
  initTheme(overwriteTheme, theme)

  expect(getCSSVariablesRuleset(theme)).toMatchInlineSnapshot(
    `"--colors-white:#FFFFFF;--colors-gray:#EEEEEE;--gap-xs:2;--gap-s:4;--radius-xs:2;--radius-s:4;--radius-m:6;"`,
  )
  expect(getCSSVariablesRuleset(overwriteTheme)).toMatchInlineSnapshot(`"--colors-gray:#EFEFEF;"`)
})

test('should inherit theme correctly', () => {
  const overwriteTheme: Theme = {}
  initTheme(overwriteTheme, theme)

  // @ts-expect-error exists
  expect(overwriteTheme.$$nutlet.parent).not.toBeUndefined()
  expect(overwriteTheme).toMatchInlineSnapshot(`
    Object {
      "$$nutlet": Object {
        "className": "theme-n1d8ny",
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
    }
  `)
})

test('should replace theme token correctly', () => {
  expect(replaceThemeToken(theme, '$colors.white')).toBe('var(--colors-white)')
  expect(replaceThemeToken(theme, '$gap.xs solid $colors.gray')).toBe('var(--gap-xs) solid var(--colors-gray)')
  expect(replaceThemeToken(theme, '$background')).toBe('var(--colors-gray)')
})
