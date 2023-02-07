import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// https://github.com/sodatea/vite-plugin-node-stdlib-browser
import nodePolyfills from 'vite-plugin-node-stdlib-browser'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nodePolyfills(), react()],
})
