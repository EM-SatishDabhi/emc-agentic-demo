import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the greeting', () => {
    render(<App />)
    expect(screen.getByText('Hello from Satish')).toBeInTheDocument()
  })

  it('greeting is visible', () => {
    render(<App />)
    const el = screen.getByText('Hello from Satish')
    expect(el).toBeVisible()
  })
})
