import { compile, middleware, serialize, prefix, RULESET, DECLARATION, stringify } from 'stylis'

import { insertRules } from './sheet'
import { Theme, replaceThemeToken } from './theme'
import { StylesInit, CSSProps, Element } from './types'
import { keys, hashString, entries } from './util'

const unitlessKeys: { [key in keyof CSSProps]: 1 } = {
  animationIterationCount: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  msFlexPositive: 1,
  flexShrink: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnStart: 1,
  msGridRows: 1,
  msGridColumns: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WebkitLineClamp: 1,

  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1,
}

export function css<Variants>(
  stylesInit: StylesInit<Variants>,
  theme?: Theme,
  variantProps: Record<string | number, unknown> = {},
): string {
  const classNames: string[] = []

  const { variants, ...cssInit } = stylesInit
  const blocks: Array<{ init: CSSProps; variant?: string; variantValue?: unknown }> = []

  if (keys(cssInit).length) {
    blocks.push({ init: cssInit })
  }

  if (variants) {
    Object.entries(variantProps).forEach(([key, value]) => {
      // @ts-expect-error type actually matches
      const variantInit = variants[key][value]
      if (variantInit) {
        blocks.push({ init: variantInit, variant: key, variantValue: value })
      }
    })
  }

  blocks.forEach((block) => {
    const stringifiedStyle = stringifyCSSProps(block.init)

    const hash = hashString(stringifiedStyle)
    const className = block.variant ? `${block.variant}-${block.variantValue}--${hash}` : hash

    insertRules(generateRules(className, stringifiedStyle, theme))
    classNames.push(className)
  })

  return classNames.join(' ')
}

function processNumericValue(key: string, val: string | number): string | number {
  if (!unitlessKeys[key as keyof CSSProps] && typeof val === 'number') {
    return `${val}px`
  }

  return val
}

export function stringifyCSSProps(props: CSSProps): string {
  return entries(props).reduce((str, [key, val]) => {
    if (val) {
      if (typeof val === 'object') {
        if (!Array.isArray(val)) {
          str += `${key}{${stringifyCSSProps(val)}}`
        }
      } else {
        str += `${key.replace(/[A-Z]|^ms/g, '-$&').toLowerCase()}:${processNumericValue(key, val)};`
      }
    }
    return str
  }, '')
}

const fixedElements = new WeakSet<Element>()
function compatSelector(element: Extract<Element, { type: typeof RULESET }>) {
  if (
    !element.parent ||
    // .length indicates if this rule contains pseudo or not
    !element.length
  ) {
    return
  }

  let parent = element.parent
  const value = element.value

  // if this is an implicitly inserted rule (the one eagerly inserted at the each new nested level)
  // then the props has already been manipulated beforehand as they that array is shared between it and its "rule parent"
  if (element.column === parent.column && element.line === parent.line) {
    return
  }

  while (parent.type !== RULESET) {
    if (parent.parent) {
      parent = parent.parent
    } else {
      return
    }
  }

  // short-circuit for the simplest case
  if (element.props.length === 1 && value.charCodeAt(0) !== /* colon */ 58 && !fixedElements.has(parent)) {
    return
  }

  fixedElements.add(element)

  let i = 0

  value.split(',').forEach((rawSelector) => {
    ;(parent.props as string[]).forEach((parentSelector) => {
      if (rawSelector.startsWith(':')) {
        element.props[i++] = parentSelector + rawSelector
      } else {
        element.props[i++] = rawSelector.includes('&\f')
          ? rawSelector.replace(/&\f/g, parentSelector)
          : `${parentSelector} ${rawSelector}`
      }
    })
  })
}

export function generateRules(className: string, initialStyle: string, theme?: Theme): string[] {
  const rules: string[] = []

  const normalizeMiddleware = (element: Element) => {
    if (element.type === RULESET) {
      compatSelector(element)
      // console.log(element)
    }

    if (element.type === DECLARATION) {
      let { children: value } = element

      if (theme) {
        value = replaceThemeToken(theme, value)
      }

      element.return = prefix(`${element.props}:${value};`, element.length)
      // console.log(element)
    }
  }

  serialize(
    compile(`.${className}{${initialStyle}`),
    middleware([
      // @ts-expect-error we use more accurate element type to reduce type casting and avoid useless runtime assertion
      normalizeMiddleware,
      stringify,
      (element) => {
        if (!element.root && element.return) {
          rules.push(element.return)
        }
      },
    ]),
  )

  return rules
}
