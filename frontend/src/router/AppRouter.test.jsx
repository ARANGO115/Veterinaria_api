import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { cleanup, render, screen } from '@testing-library/react'
import AppRouter from './AppRouter'

function renderAtPath(path) {
  window.history.replaceState({}, '', path)
  return render(<AppRouter />)
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})

describe('AppRouter', () => {
  it('renders the login page heading and description', () => {
    renderAtPath('/login')

    expect(
      screen.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Ruta pública para autenticarse en la plataforma.'),
    ).toBeInTheDocument()
  })

  it('redirects to login when accessing the dashboard without a token', async () => {
    localStorage.clear()
    renderAtPath('/dashboard')

    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })

  it('renders the dashboard when a token is present', () => {
    localStorage.setItem('token', 'test-token')
    renderAtPath('/dashboard')

    expect(
      screen.getByRole('heading', { name: 'Panel principal' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Iniciar sesión' }),
    ).not.toBeInTheDocument()
  })
})
