import { createContext, createElement, FC, useContext } from 'react'

import { insertRules } from './sheet'
import { RecursivePartial } from './types'
import { entries, get, hashString } from './util'

// let user do declaration merge
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Theme {}

export type NutletTheme = Theme & {
  $$nutlet?: {
    className: string
    parent?: NutletTheme
  }
}

export const themeContext = createContext<Theme | undefined>(undefined)
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ThemeComsumer = themeContext.Consumer
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ThemeProvider: FC<{ theme: RecursivePartial<Theme> }> = ({ theme, children }) => {
  const parentTheme = useContext(themeContext)
  if (!('$$nutlet' in theme)) {
    const nutletTheme = initTheme(theme, parentTheme)

    const ruleset = getCSSVariablesRuleset(nutletTheme)
    insertRules([`.${nutletTheme.$$nutlet!.className}{${ruleset}}`])
  }

  return createElement(themeContext.Provider, { value: theme, children })
}

export function initTheme(theme: Theme, parent?: Theme): NutletTheme {
  if ('$$nutlet' in theme) {
    return theme
  }

  const hash = hashString(JSON.stringify(theme))

  ;(<NutletTheme>theme).$$nutlet = {
    // avoid hash starts with numbers which are not a valid selector in css
    className: `theme-${hash}`,
    parent: parent as NutletTheme,
  }

  return theme as NutletTheme
}

export function getCSSVariablesRuleset(theme: NutletTheme, scope = ''): string {
  let ruleset = ''
  if (!theme) {
    return ''
  }

  entries(theme).map(([key, val]) => {
    if (key === '$$nutlet') {
      return
    }
    if (typeof val === 'string') {
      if (!val.startsWith('$')) {
        ruleset += `--${scope}-${key}:${val};`
      }
    } else if (typeof val === 'number') {
      ruleset += `--${scope}-${key}:${val};`
    } else {
      ruleset += getCSSVariablesRuleset(val, scope ? `${scope}-${key}` : key)
    }
  })

  return ruleset
}

export function getThemeClassName(theme: NutletTheme): string {
  let $$nutlet = theme.$$nutlet
  const classNames: string[] = []

  while ($$nutlet) {
    classNames.unshift($$nutlet.className)
    $$nutlet = $$nutlet.parent?.$$nutlet
  }

  return classNames.join(' ')
}

const themeTokenPattern = /\$([a-zA-Z0-9.]+)/
export function replaceThemeToken(theme: NutletTheme, value: string): string {
  let match: RegExpExecArray | null = null

  while ((match = themeTokenPattern.exec(value))) {
    const tokenPath = match[1]
    const token = get(theme, tokenPath)

    if (token) {
      let replacer: string
      if (typeof token === 'object') {
        throw new Error(`Expect String or Number in path '$${tokenPath}', but an object found ${JSON.stringify(token)}`)
      } else if (typeof token === 'string' && token.startsWith('$')) {
        // tokens use other token
        replacer = replaceThemeToken(theme, token)
      } else {
        replacer = `var(--${tokenPath.replace(/\./g, '-')})`
      }

      value = value.substring(0, match.index) + replacer + value.substring(match.index + tokenPath.length + 1)
    } else if (value.includes('$')) {
      if (theme.$$nutlet?.parent) {
        return replaceThemeToken(theme.$$nutlet.parent, value)
      } else {
        throw new Error(`No theme variable defined in path '$${tokenPath}'`)
      }
    }
  }

  return value
}
