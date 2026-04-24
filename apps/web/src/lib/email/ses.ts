import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

import { createClient } from '@/lib/supabase/server'

const FROM_ADDRESS = 'OLAAC Observatorio <no-reply@olaac.org>'

function getSESClient(): SESClient | null {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) return null

  return new SESClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  })
}

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
  type: string
  userId?: string
  metadata?: Record<string, unknown>
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const client = getSESClient()

  if (!client) {
    // Entorno sin credenciales configuradas — loguear y saltar
    console.log(`[email:${params.type}] → ${params.to} | ${params.subject} (SES no configurado)`)
    await logNotification({ ...params, status: 'skipped' })
    return
  }

  try {
    await client.send(
      new SendEmailCommand({
        Source: FROM_ADDRESS,
        Destination: { ToAddresses: [params.to] },
        Message: {
          Subject: { Data: params.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: params.html, Charset: 'UTF-8' },
            Text: { Data: params.text, Charset: 'UTF-8' },
          },
        },
      })
    )
    await logNotification({ ...params, status: 'sent' })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error(`[email:${params.type}] error → ${params.to}:`, error)
    await logNotification({ ...params, status: 'failed', error })
  }
}

async function logNotification(params: SendEmailParams & { status: 'sent' | 'failed' | 'skipped'; error?: string }) {
  try {
    const supabase = await createClient()
    await supabase.from('notification_log').insert({
      user_id:  params.userId ?? null,
      email:    params.to,
      type:     params.type,
      subject:  params.subject,
      status:   params.status,
      error:    params.error ?? null,
      metadata: params.metadata ?? null,
    })
  } catch {
    // El log nunca debe romper el flujo principal
  }
}
