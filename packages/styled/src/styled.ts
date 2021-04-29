import { createElement, ElementType, useContext, ReactElement } from 'react'

import { css } from './css'
import { getThemeClassName, themeContext } from './theme'
import { StyledProps, StylesInit } from './types'
import { keys, splitObject } from './util'

function splitProps(props: Record<string, unknown>, variants: string[]) {
  const { passThrough, styled, as } = splitObject(props, (key) =>
    key === 'as' ? 'as' : variants.includes(key) ? 'styled' : 'passThrough',
  )

  return {
    passThrough,
    styled,
    asTarget: as?.as as keyof JSX.IntrinsicElements | undefined,
  }
}

type StyledComponentProps<E, Variants> = E extends keyof JSX.IntrinsicElements
  ? StyledProps<Variants, JSX.IntrinsicElements[E]>
  : E extends ElementType<infer P>
  ? StyledProps<Variants, P>
  : unknown

type StyledComponent<E, Variants> = (props: StyledComponentProps<E, Variants>) => ReactElement

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function styled<E extends ElementType, Variants>(
  el: E,
  stylesInit: StylesInit<Variants>,
): StyledComponent<E, Variants> {
  const availableVariants = keys(stylesInit.variants ?? {})

  const StyledComponent = (props: StyledComponentProps<E, Variants>) => {
    const { passThrough = {}, styled = {}, asTarget } = splitProps(props, availableVariants)

    const theme = useContext(themeContext)
    const styledClassName = css(stylesInit, theme, styled)

    // class names follow the order in:
    // 'theme-className styled-className prop-className'
    const classNames: string[] = []

    // avoid append theme class name multi times
    if (typeof el === 'string' && theme) {
      classNames.push(getThemeClassName(theme))
    }
    classNames.push(styledClassName)
    if (passThrough.className) {
      classNames.push(passThrough.className as string)
    }
    passThrough.className = classNames.join(' ')

    let renderEl: ElementType = el
    if (asTarget) {
      if (typeof renderEl === 'string' && asTarget !== renderEl) {
        renderEl = asTarget
      } else {
        passThrough.as = asTarget
      }
    }

    return createElement(renderEl, passThrough)
  }

  StyledComponent.displayName = `styled(${
    typeof el === 'string'
      ? el
      : // @ts-expect-error naming
        el.name ?? el.displayName ?? 'unknown'
  })`

  return StyledComponent
}
