import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
  }

  if (command === 'build') {
    return {
      ...config,
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'Autocomplete',
          fileName: 'index',
          formats: ['es']
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        }
      }
    }
  }

  // Dev configuration (for demo)
  return {
    ...config,
    root: 'demo'
  }
})
