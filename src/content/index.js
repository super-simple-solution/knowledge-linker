import '@/style/index.scss'

let count = 0
let inited = false
// 停用词hash
const stopWordsHashMap = {}
// 当前文档不满足匹配词的hash
const misMatchedHashMap = {}
const matchedHashMap = {}
const keyWordList = ['比较火', '十二届', '沉浸式']

// 过滤纯数字，标点，javascript或者json代码，及html模板
function nodeFilter(node) {
  return node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 2
}

wrapTextNodes()

function wrapTextNodes() {
  if (inited) return
  if (count++ > 5) return
  const result = {
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
    console.log(textNode.nodeValue, 'textNode')
    const content = textNode.nodeValue.trim()
    result.contentList.push(content)
    let textRes = ''
    // TODO: 避免encoder 匹配上 encode 关键词
    if (!/\s/.test(content) && /^\w+$/.test(content)) {
      // 单词
      result.singleWordCount++
      textRes = matchKeyWord(content, content)
    } else {
      // TODO: indexOf过于粗糙
      // 句子
      textRes = content
      for (let i = 0; i < keyWordList.length; i++) {
        if (textRes.indexOf(keyWordList[i]) !== -1) {
          textRes = matchKeyWord(keyWordList[i], textRes)
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
    textNode.parentNode.insertBefore(wrapper, textNode)
    textNode.parentNode.removeChild(textNode)
  })
  console.log(result, 'result')
  if (result.contentList.length < 10) {
    setTimeout(wrapTextNodes, 2000)
    return
  }
  inited = true
  return result
}

function matchKeyWord(word, nodeValue) {
  if (misMatchedHashMap[word]) return
  if (stopWordsHashMap[word]) {
    misMatchedHashMap[word] = 0
    return
  }
  if (matchedHashMap[word]) {
    return markWord(word, nodeValue)
  }
  if (keyWordList.indexOf(word) !== -1) {
    // id 递增
    matchedHashMap[word] = Object.keys(matchedHashMap).length
    return markWord(word, nodeValue)
  } else {
    misMatchedHashMap[word] = 0
  }
}

function markWord(word, nodeValue) {
  const elStr = `<sss-highlight id="sss-${matchedHashMap[word]}" class="sss-underline sss-mark" data-word="${word}"><sss-origin>${word}</sss-origin></sss-highlight>`
  if (word === nodeValue) {
    return elStr
  } else {
    return nodeValue.replace(new RegExp(word, 'g'), elStr)
  }
}
