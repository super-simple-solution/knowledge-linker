/* https://gist.github.com/borestad/eac42120613bc67a3714f115e8b485a7
 * Custom jsx parser
 * See: tsconfig.json
 *
 *   {
 *     "jsx": "react",
 *     "jsxFactory": "h",
 *     "lib": [
 *       "es2017",
 *       "dom",
 *       "dom.iterable"
 *     ]
 *   }
 *
 */

export const entityMap = {
  '&': 'amp',
  '<': 'lt',
  '>': 'gt',
  '"': 'quot',
  '\'': '#39', // eslint-disable-line
  '/': '#x2F',
}

export const escapeHtml = (str: string) =>
  String(str).replace(/[&<>"'/\\]/g, (s: string) => `&${entityMap[s as keyof typeof entityMap]};`)

// To keep some consistency with React DOM, lets use a mapper
// https://reactjs.org/docs/dom-elements.html
export const AttributeMapper = (val: string) =>
  ({
    tabIndex: 'tabindex',
    className: 'class',
    readOnly: 'readonly',
  }[val] || val)

// tslint:disable-next-line:no-default-export
export function h(
  // eslint-disable-next-line @typescript-eslint/ban-types
  tag: Function | string,
  attrs?: { [key: string]: any },
  ...children: (HTMLElement | string)[]
): HTMLElement {
  attrs = attrs || {}
  const stack: any[] = [...children]

  // Support for components(ish)
  if (typeof tag === 'function') {
    attrs.children = stack
    return tag(attrs)
  }

  const elm = document.createElement(tag)

  // Add attributes
  // eslint-disable-next-line prefer-const
  for (let [name, val] of Object.entries(attrs)) {
    // event
    if (name.startsWith('on')) {
      elm.addEventListener(name.slice(2).toLowerCase(), val)
      continue
    }
    name = escapeHtml(AttributeMapper(name))
    if (name === 'style') {
      Object.assign(elm.style, val)
    } else if (val === true) {
      elm.setAttribute(name, name)
    } else if (val !== false && val != null) {
      if (['src', 'href'].includes(name)) {
        elm.setAttribute(name, val)
      } else {
        elm.setAttribute(name, escapeHtml(val))
      }
    } else if (val === false) {
      elm.removeAttribute(name)
    }
  }

  // Append children
  while (stack.length) {
    const child = stack.shift()

    // Is child a leaf?
    if (!Array.isArray(child)) {
      elm.appendChild((child as HTMLElement).nodeType == null ? document.createTextNode(child.toString()) : child)
    } else {
      stack.push(...child)
    }
  }

  return elm
}

export function Fragment(...children: (HTMLElement | string)[]): (HTMLElement | string)[] {
  return children
}
