import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

test('renders the app shell with dark mode toggle', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: 'My Templates' })).toBeTruthy()
  expect(screen.getByRole('button', { name: '+ Add Template' })).toBeTruthy()

  const toggle = screen.getByRole('button', { name: 'Dark' })
  fireEvent.click(toggle)
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})
