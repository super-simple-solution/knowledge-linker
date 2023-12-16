import keywordMap from '@/term.js'
import { createPopper } from '@popperjs/core'

let count = 0
let inited = false
let popperInstance: any

type Map = {
  [key: string]: number
}

type wordData = {
  title: string
  translate: {
    zh: string
  }
  content: string
  detail: string
  links: [
    {
      src: string
      source_name: string
    },
  ]
}

const stopWordsHashMap: Map = {}
// 当前文档不满足匹配词的hash
const misMatchedHashMap: Map = {}
const matchedHashMap: Map = {}

// const keywordList = ['比较火', '十二届', '沉浸式']
const keywordList = Object.keys(keywordMap)

// 过滤纯数字，标点，javascript或者json代码，及html模板
function nodeFilter(node: Node) {
  return (node.nodeValue || '').trim().length > 2 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
}

export function markKeyWord() {
  if (inited) return
  if (count++ > 5) return
  type ContentResult = {
    contentList: string[]
    singleWordCount: number
  }
  const result: ContentResult = {
    contentList: [],
    singleWordCount: 0,
  }

  const treeWalker = document.createTreeWalker(
    document.body, // 从body元素开始
    NodeFilter.SHOW_TEXT, // 只遍历文本节点
    {
      acceptNode: nodeFilter,
    },
  )

  const operateNodes = []

  while (treeWalker.nextNode()) {
    // 遍历所有文本节点`
    const textNode = treeWalker.currentNode
    const nodeValue = textNode.nodeValue || ''
    const content = nodeValue.trim()
    result.contentList.push(content)
    let textRes = ''
    // TODO: 避免encoder 匹配上 encode 关键词
    if (!/\s/.test(content) && /^\w+$/.test(content)) {
      // 单词
      result.singleWordCount++
      textRes = matchKeyWord(content, content) || ''
    } else {
      // TODO: indexOf过于粗糙
      // 句子
      textRes = content
      for (let i = 0; i < keywordList.length; i++) {
        if (textRes.indexOf(keywordList[i]) !== -1) {
          textRes = matchKeyWord(keywordList[i], textRes) || ''
        }
      }
    }
    if (textRes && textRes.length !== content.length) {
      operateNodes.push({
        node: textNode,
        content: textRes,
      })
    }
  }
  operateNodes.forEach(({ node: textNode, content: textRes }) => {
    const wrapper = document.createElement('sss-hc')
    wrapper.innerHTML = textRes
    textNode.parentNode?.insertBefore(wrapper, textNode)
    textNode.parentNode?.removeChild(textNode)
  })
  if (result.contentList.length < 10) {
    setTimeout(markKeyWord, 2000)
    return
  }
  if (operateNodes.length) {
    initTooltip()
  }
  inited = true
  console.log(matchedHashMap, 'matchedHashMap')
  return result
}

function initTooltip() {
  const tooltip = document.createElement('div')
  tooltip.id = 'tooltip'
  tooltip.innerHTML = '<div id="arrow" data-popper-arrow></div>'
  document.body.appendChild(tooltip)
}

function matchKeyWord(word: string, nodeValue: string) {
  if (misMatchedHashMap[word]) return
  if (stopWordsHashMap[word]) {
    misMatchedHashMap[word] = 0
    return
  }
  if (matchedHashMap[word]) {
    return markWord(word, nodeValue)
  }
  if (keywordList.indexOf(word) !== -1) {
    // id 递增
    matchedHashMap[word] = Object.keys(matchedHashMap).length
    return markWord(word, nodeValue)
  } else {
    misMatchedHashMap[word] = 0
  }
}

function markWord(word: string, nodeValue: string): string {
  const elStr = `<sss-highlight id="sss-${matchedHashMap[word]}" class="sss-underline sss-mark" data-word="${word}"><sss-origin>${word}</sss-origin></sss-highlight>`
  if (word === nodeValue) {
    return elStr
  } else {
    return nodeValue.replace(new RegExp(word, 'g'), elStr)
  }
}

document.addEventListener('mouseover', (e) => {
  const target = e.target as Element
  if (!target.textContent || !target.parentElement) return
  if (target?.tagName === 'SSS-ORIGIN') {
    const word = target.textContent.trim()
    const wordItem = keywordMap[word as keyof typeof keywordMap]
    const tooltip = document.getElementById('tooltip')
    if (!tooltip) return
    const tooltipContent = tooltipContentGene(wordItem as wordData)
    if (tooltip.childElementCount === 1) {
      // @ts-expect-error jsx dom
      tooltip.appendChild(tooltipContent)
    } else {
      // @ts-expect-error jsx dom
      tooltip.replaceChild(tooltipContent, tooltip.children[1])
    }
    if (!popperInstance) {
      popperInstance = createPopper(target.parentElement, tooltip as HTMLElement)
    }
  } else if (target.closest('#tooltip')) {
    return
  } else {
    hidePop()
  }
})

function hidePop() {
  if (!popperInstance) return
  popperInstance.destroy()
  popperInstance = null
}

function tooltipContentGene(data: wordData) {
  return (
    <div>
      <div className="sss-tooltip-title">{data.title}</div>
      <div className="sss-tooltip-content">{data.content}</div>
      <div className="sss-tooltip-footer float-right">
        {data.links.map((item) => {
          return (
            <a href={item.src} target="_blank">
              {item.source_name}
            </a>
          )
        })}
      </div>
    </div>
  )
}
