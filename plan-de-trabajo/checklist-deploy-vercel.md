# Checklist — Primer despliegue a producción en Vercel
**Proyecto:** OLAAC Monorepo (Next.js 14 + Supabase)  
**Generado:** 2026-04-25

---

## 0. Prerequisitos

- [ ] Cuenta Vercel con acceso al repositorio GitHub del monorepo
- [ ] Dominio `olaac.org` disponible y con acceso al panel DNS
- [ ] Credenciales AWS IAM para SES (si se usa email transaccional)

---

## 1. Variables de entorno en Vercel

Configurar en **Project Settings → Environment Variables** para scope `Production`:

| Variable | Dónde obtenerla |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_APP_URL` | `https://olaac.org` |
| `NEXT_PUBLIC_ACADEMY_URL` | `https://academia.olaac.org` |
| `AWS_ACCESS_KEY_ID` | AWS IAM Console |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Console |
| `AWS_REGION` | ej. `us-east-1` |

> ⚠️ Nunca commitear `.env.local`. Está correctamente en `.gitignore`.

Para Preview deployments usar valores de staging (otro proyecto Supabase o las mismas claves de desarrollo).

---

## 2. Proyectos en Vercel (monorepo = 2 proyectos)

### Proyecto 1: `olaac-web` (apps/web)
- **Framework:** Next.js
- **Root Directory:** `apps/web`
- **Build Command:** `pnpm build` (Turbo lo detecta automáticamente)
- **Install Command:** `pnpm install`
- **Output Directory:** `.next`

### Proyecto 2: `olaac-academy` (apps/academy)
- **Framework:** Next.js
- **Root Directory:** `apps/academy`
- **Build Command:** `pnpm build`
- **Install Command:** `pnpm install`
- **Output Directory:** `.next`

> Vercel detecta `turbo.json` y `pnpm-workspace.yaml` automáticamente.

---

## 3. Dominios

### olaac-web
1. Vercel Dashboard → `olaac-web` → Settings → Domains
2. Agregar: `olaac.org` y `www.olaac.org`
3. DNS en registrador:
   ```
   A     @     76.76.19.165
   CNAME www   cname.vercel-dns.com
   ```

### olaac-academy
1. Agregar: `academia.olaac.org`
2. DNS:
   ```
   CNAME academia   cname.vercel-dns.com
   ```

> SSL/TLS: automático vía Let's Encrypt — no requiere configuración.

---

## 4. Supabase — configuración de producción

### 4a. URL Configuration
**Supabase Dashboard → Authentication → URL Configuration:**

```
Site URL:         https://olaac.org
Redirect URLs:
  https://olaac.org/auth/callback
  https://olaac.org/registro/completar
  https://academia.olaac.org/auth/callback
  http://localhost:3000/auth/callback
  http://localhost:3001/auth/callback
```

### 4b. Email provider
Supabase usa su propio SMTP para magic links por defecto (límite 3 emails/hora en free tier).  
Para producción: **Authentication → SMTP Settings** → configurar Amazon SES o Resend.

### 4c. Backups
**Database → Backups:** verificar que los backups diarios automáticos estén habilitados.

---

## 5. Migraciones de base de datos

Las 11 migraciones ya están aplicadas en el proyecto remoto `swcpyxdyidwyugyzenaz`.  
Para futuros despliegues:

```bash
npx supabase db push --linked
```

---

## 6. Storage bucket

**Supabase → Storage → Buckets:**
- [ ] Confirmar que el bucket `certificates` existe con acceso privado
- [ ] Verificar política de lectura por folio (migración 004)

---

## 7. Usuario admin inicial

Después del primer deploy:
1. Registrarse en `https://olaac.org/registro`
2. Copiar el UUID del usuario desde Supabase → Authentication → Users
3. Insertar en Supabase → SQL Editor:

```sql
INSERT INTO admin_users (user_id) VALUES ('[TU_UUID]');
```

---

## 8. Verificación post-deploy

- [ ] `https://olaac.org` carga correctamente
- [ ] `https://academia.olaac.org` carga correctamente
- [ ] Registro con magic link funciona
- [ ] Acceso a `/admin` redirige a `/login` si no hay sesión
- [ ] Acceso a `/admin` funciona para el usuario admin
- [ ] API pública responde: `https://olaac.org/api/v1`
- [ ] Rate limiting activo: más de 120 req/min devuelve 429
- [ ] Headers de seguridad presentes (verificar con [securityheaders.com])
- [ ] Generación de certificados PDF funciona
- [ ] Badge de distintivo responde por folio

---

## 9. Headers de seguridad (ya implementados)

Los headers están configurados en `apps/web/next.config.ts` y `apps/academy/next.config.ts`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy` (permite Supabase WebSockets)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (desactiva geolocalización, micrófono, cámara)

---

## 10. Rate limiting API v1 (ya implementado)

Middleware en `src/middleware.ts` aplica **120 req/min por IP** a todas las rutas `/api/v1/*`.  
Responde con headers estándar `X-RateLimit-*` y código 429 al superar el límite.

> Para alto tráfico en producción: migrar a [Upstash Redis](https://upstash.com) para rate limiting distribuido entre instancias de Vercel.

---

## Resumen de seguridad

| Hallazgo | Estado |
|----------|--------|
| `.env.local` nunca commiteado | ✅ Confirmado |
| RLS habilitado en todas las tablas | ✅ Implementado |
| Headers de seguridad HTTP | ✅ Implementado |
| Rate limiting API v1 | ✅ Implementado |
| Autenticación admin en múltiples capas | ✅ Implementado |
| Validación de inputs (manual, funcional) | ⚠️ Mejorable con Zod |
| Datos sensibles no expuestos en APIs públicas | ✅ Confirmado |
| Rate limiting distribuido (Upstash) | ⚠️ Mejora futura |
