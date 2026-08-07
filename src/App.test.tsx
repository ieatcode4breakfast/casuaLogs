import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

test('renders the app shell and the counter increments', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Get started' })).toBeTruthy()

  const button = screen.getByRole('button', { name: /count is 0/i })
  fireEvent.click(button)
  expect(screen.getByRole('button', { name: /count is 1/i })).toBeTruthy()
})