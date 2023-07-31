import { createApp } from 'vue'
import App from './App.vue'
import { getEle } from '@/utils'

console.log('soption')
document.addEventListener('DOMContentLoaded', function () {
  const container = getEle('app')
  if (!container) return

  const app = createApp(App)
  app.mount('#app')
})
