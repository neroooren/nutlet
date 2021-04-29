import { generateRules, stringifyCSSProps } from '../css'
import { initTheme } from '../theme'
import { CSSProps } from '../types'
import { entries } from '../util'

const theme = {
  colors: {
    blue: 'blue',
    yellow: 'yellow',
  },
}

const normal: CSSProps = {
  color: 'green',
  border: '1px solid gray',
  fontSize: 12,
}

const implicitParentSelector: CSSProps = {
  ':hover': {
    color: '$colors.blue',
  },
}

const complexImplicitParentSelector: CSSProps = {
  ...implicitParentSelector,
  ':hover': {
    '> :first-child': {
      fontWeight: 500,
    },
  },
}

const explicitParentSelector: CSSProps = {
  ...normal,
  '&:hover': { color: '$colors.blue' },
  ':active': { outline: '$colors.yellow' },
}

const parentSelectorCoExist: CSSProps = {
  ...normal,
  '&:hover': { '::before': { content: '":hover::before"', position: 'absolute' } },
  '::after': { '&:hover': { content: '"::after:hover"' } },
  '&, :hover': { '::before': { content: "'::before,:hover::before'" } },
  '& + &::after:': { '&:hover:': { content: '":hover+::after:hover"' } },
  '&, :not(:first-child)': { '::before, &::after': { content: '"complex"' } },
}

const prefix: CSSProps = {
  transform: 'rotate(180deg)',
  display: 'flex',
}

const cssProps = {
  normal,
  implicitParentSelector,
  complexImplicitParentSelector,
  explicitParentSelector,
  parentSelectorCoExist,
  prefix,
}

test('stringifyCSSProps', () => {
  expect(
    stringifyCSSProps({
      fontSize: 14,
      '*': {
        fontWeight: 400,
      },
    }),
  ).toBe('font-size:14px;*{font-weight:400;}')
})

test('generateRules', () => {
  initTheme(theme)

  entries(cssProps).forEach(([name, props]) => {
    expect(generateRules('n', stringifyCSSProps(props), theme)).toMatchSnapshot(`${name}: 
.n ${JSON.stringify(props, null, 2)}`)
  })
})
