const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://olaac.org'

export function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>OLAAC</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f3f4f6">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td bgcolor="#252858" style="padding:28px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family:Arial,sans-serif;font-size:24px;font-weight:bold;color:#ffffff;letter-spacing:2px;">OLAAC</span>
                    <br>
                    <span style="font-family:Arial,sans-serif;font-size:11px;color:#C9EAF2;letter-spacing:0.5px;">Observatorio Latinoamericano de Accesibilidad</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#30BCEE;"></span>
                    <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#30BCEE;margin-left:4px;opacity:0.6;"></span>
                    <span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:#30BCEE;margin-left:4px;opacity:0.3;"></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 40px 28px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f9fafb" style="padding:24px 40px;border-top:1px solid #e5e7eb;">

              <!-- Aviso cuenta no supervisada -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
                <tr>
                  <td bgcolor="#fffbeb" style="padding:10px 14px;border-radius:6px;border-left:3px solid #f59e0b;">
                    <p style="margin:0;font-size:12px;color:#92400e;font-family:Arial,sans-serif;line-height:1.5;">
                      <strong>Cuenta no supervisada.</strong> Este mensaje fue enviado desde no-reply@olaac.org, una dirección de solo notificación. Las respuestas a este correo no serán atendidas. Para contactarnos usa nuestras redes sociales oficiales o <a href="${APP_URL}/tickets/nuevo" style="color:#92400e;font-weight:bold;">crea un ticket</a>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Redes sociales -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:14px;">
                <tr>
                  <td align="center" style="font-size:12px;color:#6b7280;font-family:Arial,sans-serif;line-height:2;">
                    <a href="mailto:hola@olaac.org" style="color:#4452a6;text-decoration:none;font-family:Arial,sans-serif;">✉&nbsp;hola@olaac.org</a>
                    &nbsp;&nbsp;·&nbsp;&nbsp;
                    <a href="https://www.linkedin.com/company/olaac/" target="_blank" style="color:#4452a6;text-decoration:none;font-family:Arial,sans-serif;">LinkedIn</a>
                    &nbsp;&nbsp;·&nbsp;&nbsp;
                    <a href="https://x.com/a11yLatam" target="_blank" style="color:#4452a6;text-decoration:none;font-family:Arial,sans-serif;">X&nbsp;@a11yLatam</a>
                    &nbsp;&nbsp;·&nbsp;&nbsp;
                    <a href="https://www.facebook.com/ObservatorioOLAC" target="_blank" style="color:#4452a6;text-decoration:none;font-family:Arial,sans-serif;">Facebook</a>
                    &nbsp;&nbsp;·&nbsp;&nbsp;
                    <a href="https://www.youtube.com/@A11YLatam/" target="_blank" style="color:#4452a6;text-decoration:none;font-family:Arial,sans-serif;">YouTube</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;text-align:center;">
                <a href="${APP_URL}" style="color:#9ca3af;text-decoration:none;">olaac.org</a>
                &nbsp;·&nbsp; Observatorio Latinoamericano de Accesibilidad
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Botón CTA principal para emails */
export function ctaButton(text: string, url: string): string {
  return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:24px auto 0;">
    <tr>
      <td align="center" bgcolor="#252858" style="border-radius:8px;">
        <a href="${url}" target="_blank"
          style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`
}

/** Bloque de dato destacado (folio, código, etc.) */
export function highlightBox(label: string, value: string): string {
  return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:16px 0;">
    <tr>
      <td bgcolor="#f0f1f8" style="padding:16px 20px;border-radius:8px;border-left:4px solid #252858;">
        <p style="margin:0;font-size:12px;color:#606bb8;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.5px;">${label}</p>
        <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#252858;font-family:'Courier New',monospace;">${value}</p>
      </td>
    </tr>
  </table>`
}

/** Encabezado de sección (h2 style) */
export function sectionHeading(text: string): string {
  return `<h2 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#1a1d40;">${text}</h2>`
}

/** Texto de cuerpo */
export function bodyText(text: string): string {
  return `<p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:15px;color:#374151;line-height:1.6;">${text}</p>`
}

/** Divider */
export const divider = `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">`

/** Pie de página para versiones de texto plano */
export const textFooter = `
---
Este mensaje fue enviado desde no-reply@olaac.org (cuenta no supervisada).
No respondas a este correo — las respuestas no serán atendidas.
Para contactarnos: hola@olaac.org | olaac.org/tickets/nuevo

Redes sociales oficiales:
LinkedIn  → linkedin.com/company/olaac
X         → x.com/a11yLatam
Facebook  → facebook.com/ObservatorioOLAC
YouTube   → youtube.com/@A11YLatam

© OLAAC — Observatorio Latinoamericano de Accesibilidad · olaac.org`
