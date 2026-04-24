# Hoja de Ruta OLAAC
## Análisis de brechas para cumplir la misión del Observatorio

**Fecha de análisis:** Abril 2026  
**Estado del proyecto:** Infraestructura técnica sólida — brechas de misión identificadas

---

## Estado actual

El monorepo OLAAC cuenta con:
- 2 apps Next.js 14 (web en :3000, academy en :3001)
- 7 migraciones Supabase (PostgreSQL + RLS estricto)
- 33 páginas en web + 6 en academy
- 20 componentes accesibles en @olaac/ui
- Motor Lighthouse batch semanal (GitHub Actions)
- Sistema de tickets, voluntarios, distintivo (3 niveles), LMS con certificados PDF
- Panel de administración con control granular por RLS
- Identidad de marca alineada al logo oficial, paleta WCAG-compliant

---

## Brechas por prioridad

### CRÍTICO — Sin esto no hay observatorio

#### 1. Series temporales de métricas
**Problema:** `lighthouse_metrics` hace UPSERT por alias — solo guarda el valor más reciente. No hay historia.  
**Impacto:** Sin tendencias, OLAAC es una foto, no un observatorio. No se puede medir el efecto de políticas públicas, campañas o legislación.  
**Solución:** Tabla `lighthouse_snapshots` con timestamp + migrar el motor para INSERT en lugar de UPSERT. Componentes de gráfica temporal por sitio y por país.

#### 2. API pública documentada
**Problema:** No existe ningún endpoint público con documentación.  
**Impacto:** Investigadores, periodistas y ONGs no pueden consumir los datos. El observatorio no puede ser citado en papers ni alimentar dashboards de terceros.  
**Solución:** Endpoints REST `/api/v1/*` con API key, rate limiting y especificación OpenAPI.

#### 3. Reportes publicables
**Problema:** El blog existe, pero no hay informes institucionales descargables.  
**Impacto:** Un observatorio publica. Sin informes, no hay voz institucional ni evidencia acumulada.  
**Solución:** Módulo `/reportes` con informes anuales/semestrales PDF, ranking por país y sector, ficha técnica de cada auditoría.

---

### IMPORTANTE — Credibilidad institucional

#### 4. Marco legal por país
**Problema:** No hay mapa de legislación de accesibilidad por país latinoamericano.  
**Impacto:** Los datos no se conectan con obligaciones legales. No genera presión institucional.  
**Referencia:** México (NOM-035), Argentina (Ley 26522), Colombia (Resolución 1519), Brasil (Lei Brasileira de Inclusão), Chile (Ley 20422), Perú (Ley 29973).  
**Solución:** Tabla `legislacion_pais` + indicador en dashboard de scores si un sitio tiene obligación legal.

#### 5. Cobertura geográfica con criterios de representatividad
**Problema:** `lighthouse_metrics` tiene campo `pais` pero sin criterios de cuántos sitios por país, qué sectores cubrir, ni mapa de cobertura.  
**Impacto:** "Latinoamericano" sin evidencia de cobertura representativa pierde credibilidad.  
**Solución:** Definir umbral mínimo por país (ej. 20 sitios gubernamentales + 10 privados), vista de cobertura pública, mapa regional en el dashboard.

#### 6. Metodología de auditoría manual estructurada
**Problema:** Lighthouse captura ~30-40% de criterios WCAG. Los `audit_submissions` tienen `hallazgos (jsonb)` libre, sin estructura por criterio WCAG.  
**Impacto:** Las auditorías de voluntarios no son comparables entre sí ni con estándares internacionales.  
**Solución:** Formulario estructurado por criterio WCAG 2.1 AA (78 criterios), integración con axe-core para los automáticos y checklist manual para los restantes.

#### 7. Notificaciones email
**Problema:** Ningún flujo envía emails. Los usuarios deben entrar manualmente a revisar cambios.  
**Impacto:** Tickets sin respuesta, solicitudes de distintivo olvidadas, auditores que no saben que fueron aprobados.  
**Solución:** Supabase Edge Functions + Resend. Eventos: cambio de estado de ticket, avance de distintivo, aprobación de voluntario, alerta de regresión de score.

---

### NECESARIO — Operación sostenible

#### 8. Re-auditoría y alertas de regresión para el Distintivo
**Problema:** El distintivo se emite manualmente y no hay verificación posterior de que el sitio mantiene los estándares.  
**Impacto:** Organizaciones pueden degradar su accesibilidad después de obtener el badge sin consecuencias.  
**Solución:** Job periódico que re-audita sitios con distintivo vigente. Alerta si score cae por debajo del umbral. Notificación de renovación antes del vencimiento.

#### 9. Exportación de datos (CSV / JSON)
**Problema:** No hay descarga de datos desde el dashboard.  
**Impacto:** Investigadores no pueden trabajar con los datos sin acceso directo a la BD.  
**Solución:** Botón de exportación en `/scores` y en la futura API pública.

#### 10. Tests E2E e integración
**Problema:** No hay suite de tests. Ni unitarios ni E2E.  
**Impacto:** Para una plataforma que certifica accesibilidad, los bugs no detectados son un riesgo de reputación directo.  
**Solución:** Playwright para E2E de flujos críticos (crear ticket, solicitar distintivo, completar lección, generar certificado). Vitest para lógica de tokens y server actions.

---

### A MEDIANO PLAZO

#### 11. Soporte en portugués (i18n)
Brasil es el país más grande de LATAM. Sin portugués, "latinoamericano" es en la práctica "hispanohablante".  
**Solución:** next-intl + traducciones para PT-BR.

#### 12. Integración con herramientas externas
Slack/Discord para notificaciones de admin. Webhooks para terceros.

---

## Resumen ejecutivo de brechas

| # | Brecha | Prioridad | Esfuerzo estimado |
|---|--------|-----------|-------------------|
| 1 | Series temporales de métricas | Crítica | Alto — migración BD + UI |
| 2 | API pública documentada | Crítica | Medio — Route Handlers + OpenAPI |
| 3 | Reportes publicables | Crítica | Alto — PDF generación + módulo |
| 4 | Marco legal por país | Importante | Bajo — tabla + UI |
| 5 | Cobertura geográfica | Importante | Medio — criterios + mapa |
| 6 | Metodología auditoría WCAG | Importante | Alto — formulario 78 criterios |
| 7 | Notificaciones email | Importante | Medio — Edge Functions + Resend |
| 8 | Re-auditoría de distintivos | Necesario | Medio — job periódico |
| 9 | Exportación de datos | Necesario | Bajo — CSV endpoint |
| 10 | Tests E2E | Necesario | Medio — Playwright |
| 11 | i18n portugués | Mediano plazo | Alto |
| 12 | Integraciones externas | Mediano plazo | Bajo |

---

## Secuencia recomendada de implementación

```
Sesión 6 → Series temporales (lighthouse_snapshots + gráfica por sitio)
Sesión 7 → Exportación CSV + API pública v1 (lectura)
Sesión 8 → Notificaciones email (Resend + Edge Functions)
Sesión 9 → Marco legal por país + cobertura geográfica
Sesión 10 → Reportes institucionales PDF
Sesión 11 → Metodología WCAG completa (formulario estructurado)
Sesión 12 → Re-auditoría y alertas de regresión en distintivos
Sesión 13 → Tests E2E (Playwright)
Sesión 14+ → i18n portugués, integraciones externas
```

---

*Generado a partir del análisis del estado del monorepo en abril 2026.*
