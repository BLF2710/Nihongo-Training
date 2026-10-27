import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { watchTheme } from './lib/theme'
import { loadStartupLessonEdits } from './lib/startupLessonEdits'

// Keeps the light/dark theme in step with the saved choice and the device setting.
watchTheme()

// Lesson content published from the admin area is applied before the pages (and the data they derive from the
// lessons) are loaded, so every page shows it.
await loadStartupLessonEdits()
const { default: App } = await import('./App.tsx')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
