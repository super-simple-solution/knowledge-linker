import '@/style/index.scss'

let wordId = 0
// 停用词hash
const stopWordsHashMap = {}
// 当前文档不满足匹配词的hash
const misMatchedHashMap = {}
const matchedHashMap = {}
const keyWordList = ['比较火', '十二届']

window.onload = wrapTextNodes
// wrapTextNodes()

function nodeFilter(str) {
  return str.trim().length < 2
}

function wrapTextNodes() {
  const result = {
    contentList: [],
    singleWordCount: 0,
  }

  const treeWalker = document.createTreeWalker(
    document.body, // 从body元素开始
    NodeFilter.SHOW_TEXT, // 只遍历文本节点
    (node) => (nodeFilter(node.nodeValue) ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT),
  )

  while (treeWalker.nextNode()) {
    // 遍历所有文本节点`
    const textNode = treeWalker.currentNode
    const content = textNode.nodeValue.trim()
    result.contentList.push(content)
    let textRes = ''
    // TODO: 避免encoder 匹配上 encode 关键词
    if (!/\s/.test(content) && /^\w+$/.test(content)) {
      // 单词
      result.singleWordCount++
      textRes = matchKeyWord(content, textNode.nodeValue)
    } else {
      // TODO
      // 句子
      textRes = textNode.nodeValue
      for (let i = 0; i < keyWordList.length; i++) {
        if (content.indexOf(keyWordList[i]) !== -1) {
          textRes = matchKeyWord(keyWordList[i], textRes)
        }
      }
    }
    if (textRes) {
      const wrapper = document.createElement('sss-hc')
      wrapper.innerHTML = textRes
      textNode.parentNode.insertBefore(wrapper, textNode)
      textNode.parentNode.removeChild(textNode)
    }
  }
  console.log(result, 'result')
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
  return nodeValue.replace(
    new RegExp(word, 'g'),
    `<sss-highlight id="sss-${++wordId}" class="sss-underline sss-mark" data-word="${word}"><sss-origin>${word}</sss-origin></sss-highlight>`,
  )
}
