import { expect, test } from '@playwright/test'

// localePrefix: 'as-needed' → rutas en español sin prefijo de locale

test.describe('Autenticación y protección de rutas', () => {
  test('página de login carga y tiene campos accesibles', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1').first()).toBeVisible()
    // El login usa magic link → solo campo de email (sin contraseña)
    const emailInput = page.getByRole('textbox', { name: /email|correo/i })
    await expect(emailInput).toBeVisible()
    // Botón de enviar
    await expect(page.getByRole('button').first()).toBeVisible()
  })

  test('página de registro carga correctamente', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('/admin redirige a login cuando no hay sesión', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
    await expect(page).toHaveURL(/next=/)
  })

  test('/tickets redirige a login cuando no hay sesión', async ({ page }) => {
    await page.goto('/tickets')
    await expect(page).toHaveURL(/\/login/)
  })

  test('/distintivo/solicitar redirige a login cuando no hay sesión', async ({ page }) => {
    await page.goto('/distintivo/solicitar')
    await expect(page).toHaveURL(/\/login/)
  })

  test('/voluntarios/mi-panel redirige a login cuando no hay sesión', async ({ page }) => {
    await page.goto('/voluntarios/mi-panel')
    await expect(page).toHaveURL(/\/login/)
  })

  test('/distintivo/mi-organizacion redirige a login cuando no hay sesión', async ({ page }) => {
    await page.goto('/distintivo/mi-organizacion')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login en inglés tiene campo de email', async ({ page }) => {
    await page.goto('/en/login')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.getByRole('textbox').first()).toBeVisible()
  })
})
