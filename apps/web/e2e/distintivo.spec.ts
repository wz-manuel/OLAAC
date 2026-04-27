import { expect, test } from '@playwright/test'

test.describe('Distintivo de Accesibilidad', () => {
  test('/distintivo — landing page carga correctamente', async ({ page }) => {
    await page.goto('/distintivo')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('/distintivo — tiene al menos un CTA para solicitar o aplicar', async ({ page }) => {
    await page.goto('/distintivo')
    // Puede haber múltiples CTAs (solicitar plan, beca, etc.)
    const ctas = page.getByRole('link', { name: /solicitar|comenzar|aplicar/i })
    await expect(ctas.first()).toBeVisible()
  })

  test('/distintivo/verificar — formulario de verificación visible', async ({ page }) => {
    await page.goto('/distintivo/verificar')
    await expect(page.locator('h1, h2').first()).toBeVisible()
    const folioInput = page.getByRole('textbox')
    await expect(folioInput).toBeVisible()
  })

  test('/distintivo/verificar/[folio-inexistente] — no da error 500', async ({ page }) => {
    const response = await page.goto('/distintivo/verificar/OLAAC-0000-XXXXX')
    // Debe responder (200 con "no encontrado" o 404), nunca 500
    expect(response?.status()).not.toBe(500)
  })

  test('/voluntarios — página informativa de voluntarios carga', async ({ page }) => {
    await page.goto('/voluntarios')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
