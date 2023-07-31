import { resolve } from 'path'
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import eslintPlugin from 'vite-plugin-eslint'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'
import manifest from './manifest.json'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  output: {
    sourcemap: 'inline',
  },
  plugins: [
    vue(),
    crx({ manifest }),
    eslintPlugin(),
    AutoImport({
      dts: true,
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
      imports: ['vue'],
      eslintrc: {
        enabled: true, // Default `false`
        filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },
      resolvers: [() => null],
    }),
  ],
  css: {
    // https://github.com/vitejs/vite/discussions/8216
    modules: {
      scopeBehaviour: 'global',
    },
    postcss: {
      plugins: [tailwind()],
    },
  },
})
