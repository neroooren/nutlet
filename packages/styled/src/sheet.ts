let styleElement: HTMLStyleElement | null = null

function createStyleElement() {
  const tag = document.createElement('style')
  tag.setAttribute('data-nutlet', '')
  return tag
}

function getStyleElement() {
  if (!styleElement) {
    styleElement = createStyleElement()
    document.head.appendChild(styleElement)
  }

  return styleElement
}

const insertedSelector = new Set<string>()
export function insertRules(rules: string[], hidden = false) {
  rules.forEach((rule) => {
    if (process.env.NODE_ENV !== 'production') {
      rule = rule + '\n'
    }

    if (!insertedSelector.has(rule)) {
      const styleElement = getStyleElement()
      if (hidden) {
        styleElement.sheet!.insertRule(rule, styleElement.sheet!.cssRules.length)
      } else {
        styleElement.innerHTML += rule
      }
      insertedSelector.add(rule)
    }
  })
}
