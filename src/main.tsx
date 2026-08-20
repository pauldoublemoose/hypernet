import { createRoot } from 'react-dom/client'
import App from './App'
import { SessionProvider } from './lib/session'
import { UiProvider } from './ui'
import './styles.css'

// StrictMode is intentionally omitted: its double-mounted effects would
// double-submit the signup and double-start timers in dev.
createRoot(document.getElementById('root')!).render(
  <UiProvider>
    <SessionProvider>
      <App />
    </SessionProvider>
  </UiProvider>,
)
