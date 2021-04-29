import { Properties } from 'csstype'
import { DECLARATION, MEDIA, RULESET } from 'stylis'

export type Exact<T> = {
  [K in keyof T]: T[K]
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type RecursivePartial<T> = T extends {} ? { [P in keyof T]?: RecursivePartial<T[P]> | undefined } : T
export type Expect<T, P> = T extends null | undefined ? never : P

export type CSSProps =
  | Properties<string | number>
  | {
      [key: string]: CSSProps
    }

export type VariantsDef<V> = {
  [name in keyof V]: { [variant in keyof V[name]]: CSSProps }
}

export type MorphVariant<T> = T extends number
  ? `${T}` | T
  : T extends 'true' | 'false'
  ? boolean
  : T extends `${number}`
  ? number | T
  : T

export type VariantProps<Variants> = {
  [name in keyof Variants]?: MorphVariant<keyof Variants[name]>
}

export type StyledProps<Variants, P = unknown> = Omit<P, keyof VariantProps<Variants> | 'as'> &
  VariantProps<Variants> & {
    as?: keyof JSX.IntrinsicElements
    className?: string
  }

export type StylesInit<Variants> = CSSProps & {
  variants?: VariantsDef<Variants>
}

export type Element = {
  line: number
  column: number
  length: number
  parent?: Element | null
  return: string
  root?: Element
  value: string
} & (
  | {
      type: typeof DECLARATION
      children: string
      props: string
    }
  | {
      type: typeof RULESET
      children: Element
      props: string[]
    }
  | {
      type: typeof MEDIA
      children: Element
      props: string[]
    }
)
