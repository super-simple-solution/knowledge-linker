import { injectScriptByUrl } from '@/utils/extension-action.js'

init()

function init() {
  injectScriptByUrl('https://unpkg.com/@popperjs/core@2/dist/umd/popper.js')
}
