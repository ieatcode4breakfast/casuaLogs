import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: () => null,
    setItem: () => {},
  },
});

test('renders the app shell with dark mode toggle', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: 'casuaLogs' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Create Template' })).toBeTruthy()

  const toggle = screen.getByRole('button', { name: 'Toggle dark mode' })
  fireEvent.click(toggle)
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})
