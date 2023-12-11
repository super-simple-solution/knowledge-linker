import { injectScriptByUrl } from '@/utils/extension-action.js'

init()

function init() {
  injectScriptByUrl('https://unpkg.com/@popperjs/core@2/dist/umd/popper.js')
}

let wordId = 0
// 停用词hash
const stopWordsHashMap = {}
// 当前文档不满足匹配词的hash
const misMatchedHashMap = {}
const matchedHashMap = {}
const keyWordList = ['encode', 'stemmer']

wrapTextNodes()

function wrapTextNodes() {
  let result = {
    contentList: [],
    singleWordCount: 0,
  }

  var treeWalker = document.createTreeWalker(
    document.body, // 从body元素开始
    NodeFilter.SHOW_TEXT, // 只遍历文本节点
    (node) => (node.nodeValue.trim().length < 2 ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT),
  )

  while (treeWalker.nextNode()) {
    // 遍历所有文本节点
    var textNode = treeWalker.currentNode
    const content = textNode.nodeValue.trim()
    result.contentList.push(content)
    // TODO: 避免encoder 匹配上 encode 关键词
    if (!/\s/.test(content)) {
      // 单词
      result.singleWordCount++
      let wrapper = matchKeyWord(content, textNode)
      if (wrapper) {
        textNode.parentNode.insertBefore(wrapper, textNode)
        textNode.parentNode.removeChild(textNode)
      }
    } else {
      // TODO
      // 句子
    }
  }
  return result
}

function matchKeyWord(word, textNode) {
  if (misMatchedHashMap[word]) return
  if (stopWordsHashMap[word]) {
    misMatchedHashMap[word] = 0
    return
  }
  if (matchedHashMap[word]) {
    return markWord(word, textNode)
  }
  if (keyWordList.indexOf(word) !== -1) {
    // id 递增
    matchedHashMap[word] = Object.keys(matchedHashMap).length
    return markWord(word, textNode)
  } else {
    misMatchedHashMap[word] = 0
  }
}

function markWord(word, textNode) {
  var wrapper = document.createElement('sss-hc') // 创建新的元素
  var highlightedText = textNode.nodeValue.replace(
    new RegExp(word, 'g'),
    `<sss-highlight id="relin-${++wordId}" class="relingo-underline relinmark" data-word="${word}"><relin-origin>${word}</relin-origin></sss-highlight>`,
  )
  wrapper.innerHTML = highlightedText // 设置新元素的内容
  return wrapper
}
