import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/alexandria/arabic-400.css'
import '@fontsource/alexandria/arabic-500.css'
import '@fontsource/alexandria/arabic-700.css'
import '@fontsource/alexandria/arabic-900.css'
import '@fontsource/alexandria/latin-500.css'
import '@fontsource/alexandria/latin-700.css'
import '@fontsource-variable/bricolage-grotesque/index.css'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
