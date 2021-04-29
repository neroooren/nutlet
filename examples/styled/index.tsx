/* eslint-disable react/jsx-no-bind */
import React from 'react'
import ReactDOM from 'react-dom'

import { styled, Theme, ThemeProvider } from '@nutlet/styled'

declare module '@nutlet/styled' {
  interface Theme {
    colors: {
      purple: string
      blue: string
    }
  }
}

const theme: Theme = {
  colors: { purple: 'purple', blue: 'blue' },
}

const Div = styled('div', {
  color: 'green',
  '> :not(:last-child)': {
    marginRight: 10,
  },
  '@media (min-width: 800px)': {
    color: 'blue',
  },
})

const Button = styled('button', {
  color: 'black',
  variants: {
    size: {
      small: {
        color: '$colors.purple',
        fontSize: 12,
        padding: 1,
        ':hover': {
          color: '$colors.blue',
          '&::after': {
            color: 'red',
          },
        },
        '&, :hover': { '::before, ::after': { color: 'yellow' } },
        '& + &::after': { '&:hover': { color: 'black' } },
      },
      large: {
        fontSize: 14,
        padding: 8,
      },
    },

    type: {
      primary: {
        border: '1px solid $colors.blue',
      },
      danger: {
        border: '1px solid red',
      },
    },
  },
})

const CustomButton = styled(Button, {
  variants: {
    border: {
      ellipse: {
        borderRadius: '9999px',
      },
    },
  },
})

const CustomButton2 = styled(Button, {
  variants: {
    loading: {
      true: {
        backgroundColor: 'grey',
      },
    },
  },
})

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Div onClick={console.info}>
      <ThemeProvider
        theme={{
          colors: {
            blue: 'red',
          },
        }}
      >
        <Button size="small" type="primary">
          Button
        </Button>
      </ThemeProvider>
      <CustomButton size="large" type="danger" border="ellipse">
        custom button
      </CustomButton>
      <CustomButton2 loading as="a">
        CustomButton2
      </CustomButton2>
    </Div>
  </ThemeProvider>,
  document.getElementById('app'),
)
