import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

vi.mock('./services/templateService', () => ({
  getTemplates: vi.fn(() => Promise.resolve([])),
}));

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: () => null,
    setItem: () => {},
  },
});

test('renders the app shell with dark mode toggle', async () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: 'casuaLogs' })).toBeTruthy()
  expect(await screen.findByRole('button', { name: 'Create Log' })).toBeTruthy()

  const toggle = screen.getByRole('button', { name: 'Toggle dark mode' })
  fireEvent.click(toggle)
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})
