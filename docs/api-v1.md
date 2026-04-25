# OLAAC API pública — v1

Referencia técnica completa de la API REST pública del **Observatorio Latinoamericano de Accesibilidad (OLAAC)**.

## Descripción

La API v1 expone los datos de auditorías de accesibilidad Lighthouse de más de 50 sitios web de gobiernos y universidades de América Latina. Los datos se actualizan automáticamente cada domingo a las 00:00 UTC.

**URL base:** `https://olaac.org/api/v1`

## Autenticación

Ninguna. La API es completamente pública y no requiere token ni registro.

## CORS

Todas las respuestas incluyen `Access-Control-Allow-Origin: *`, lo que permite consumir la API desde cualquier dominio, incluyendo aplicaciones de frontend en el navegador.

## Caché

Las respuestas se cachean en CDN durante **1 hora** (`s-maxage=3600`) y se sirven como stale hasta **24 horas** mientras se revalida en segundo plano. Para forzar datos frescos, usa el parámetro `?_t=<timestamp>` (evita caché).

## Límite de peticiones

**120 peticiones por minuto por IP.** Para usos intensivos o de investigación, contacta a datos@olaac.org.

## Formato de respuesta

Todas las respuestas son JSON con la siguiente estructura:

### Colección
```json
{
  "data": [ ... ],
  "meta": {
    "total": 51,
    "count": 51,
    "page": 1,
    "limit": 100
  }
}
```

### Recurso individual
```json
{
  "data": { ... }
}
```

### Error
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "No se encontró el sitio \"gob-xx\"."
  }
}
```

## Códigos de error

| Código HTTP | `code`          | Descripción                              |
|-------------|-----------------|------------------------------------------|
| 400         | `INVALID_PARAM` | Parámetro de query inválido              |
| 404         | `NOT_FOUND`     | Recurso no encontrado                    |
| 500         | `DB_ERROR`      | Error interno de base de datos           |

---

## Endpoints

### `GET /api/v1`

Información general de la API: versión, endpoints disponibles, contacto.

**Respuesta:**
```json
{
  "data": {
    "api": "OLAAC Accessibility API",
    "version": "1.0.0",
    "endpoints": [ ... ],
    "license": "CC BY 4.0"
  }
}
```

---

### `GET /api/v1/sites`

Lista todos los sitios con su score de accesibilidad actual.

**Query params:**

| Parámetro  | Tipo   | Por defecto | Descripción                                      |
|------------|--------|-------------|--------------------------------------------------|
| `country`  | string | —           | Filtrar por país (case-insensitive, parcial)      |
| `category` | string | —           | Filtrar por categoría (case-insensitive, parcial) |
| `limit`    | int    | `100`       | Máximo de resultados (1–200)                     |
| `page`     | int    | `1`         | Número de página                                 |

Ordenado por `accessibility_score` descendente (mejores primero).

**Ejemplo:**
```bash
curl https://olaac.org/api/v1/sites?country=México&limit=10
```

**Respuesta:**
```json
{
  "data": [
    {
      "alias": "gob-mx",
      "nombre_sitio": "Gobierno de México",
      "url": "https://www.gob.mx",
      "pais": "México",
      "categoria": "Gobierno",
      "subcategoria": "Portal Nacional",
      "accessibility_score": 87.5,
      "issues": { "critical": 0, "serious": 2 },
      "measured_at": "2026-04-27T00:00:00Z"
    }
  ],
  "meta": { "total": 8, "count": 8, "page": 1, "limit": 100 }
}
```

---

### `GET /api/v1/sites/:alias`

Detalle de un sitio, incluyendo la lista de violaciones de accesibilidad detectadas.

**Path params:**

| Parámetro | Tipo   | Descripción                                     |
|-----------|--------|-------------------------------------------------|
| `alias`   | string | Identificador único del sitio (ej: `gob-mx`)    |

**Ejemplo:**
```bash
curl https://olaac.org/api/v1/sites/gob-mx
```

**Respuesta:**
```json
{
  "data": {
    "alias": "gob-mx",
    "nombre_sitio": "Gobierno de México",
    "url": "https://www.gob.mx",
    "pais": "México",
    "categoria": "Gobierno",
    "subcategoria": "Portal Nacional",
    "accessibility_score": 87.5,
    "issues": [
      {
        "audit_id": "color-contrast",
        "title": "Background and foreground colors do not have a sufficient contrast ratio.",
        "impact": "serious",
        "affected_count": 12
      }
    ],
    "measured_at": "2026-04-27T00:00:00Z"
  }
}
```

---

### `GET /api/v1/sites/:alias/history`

Serie temporal de auditorías de accesibilidad para un sitio. Útil para visualizar tendencias.

**Path params:**

| Parámetro | Tipo   | Descripción                     |
|-----------|--------|---------------------------------|
| `alias`   | string | Identificador único del sitio   |

**Query params:**

| Parámetro | Tipo | Por defecto | Descripción                              |
|-----------|------|-------------|------------------------------------------|
| `limit`   | int  | `52`        | Máximo de snapshots (1–104, ~2 años)    |

**Ejemplo:**
```bash
curl https://olaac.org/api/v1/sites/gob-mx/history
```

**Respuesta:**
```json
{
  "data": [
    { "measured_at": "2026-04-13T00:00:00Z", "accessibility_score": 85.0 },
    { "measured_at": "2026-04-20T00:00:00Z", "accessibility_score": 86.5 },
    { "measured_at": "2026-04-27T00:00:00Z", "accessibility_score": 87.5 }
  ],
  "meta": { "alias": "gob-mx", "count": 3 }
}
```

---

### `GET /api/v1/countries`

Estadísticas de accesibilidad agrupadas por país. Ordenado por score promedio descendente.

**Ejemplo:**
```bash
curl https://olaac.org/api/v1/countries
```

**Respuesta:**
```json
{
  "data": [
    {
      "pais": "Costa Rica",
      "avg_score": 91.2,
      "total_sitios": 3,
      "criticos": 0
    },
    {
      "pais": "México",
      "avg_score": 85.4,
      "total_sitios": 8,
      "criticos": 0
    }
  ],
  "meta": { "count": 14 }
}
```

---

### `GET /api/v1/stats`

Estadísticas globales del observatorio.

**Ejemplo:**
```bash
curl https://olaac.org/api/v1/stats
```

**Respuesta:**
```json
{
  "data": {
    "avg_score": 84.5,
    "total_sitios": 51,
    "critical_sites": 0,
    "countries_count": 14,
    "last_audit": "2026-04-27T00:00:00Z"
  }
}
```

---

## Campos de `accessibility_score`

El score es el resultado directo de la categoría **Accessibility** de Google Lighthouse (escala 0–100). Se calcula como `round(lighthouseScore * 100, 2)`.

| Rango     | Calificación OLAAC   |
|-----------|----------------------|
| 90–100    | Excelente            |
| 80–89     | Bueno                |
| 65–79     | Moderado             |
| 50–64     | Deficiente           |
| 0–49      | Crítico              |

El umbral mínimo que OLAAC recomienda para sitios públicos es **95**.

## Lista de aliases disponibles

Consulta `GET /api/v1/sites` para ver todos los aliases en uso. Algunos ejemplos:

| Alias          | Sitio                          | País     |
|----------------|--------------------------------|----------|
| `gob-mx`       | Gobierno de México             | México   |
| `imss-mx`      | IMSS                           | México   |
| `usp-br`       | Universidade de São Paulo      | Brasil   |
| `mec-br`       | Ministério da Educação         | Brasil   |
| `presidencia-ar` | Gobierno de Argentina        | Argentina|
| `unam-mx`      | UNAM                           | México   |

## Licencia

Los datos están disponibles bajo licencia **Creative Commons Attribution 4.0 International (CC BY 4.0)**. Puedes usar, distribuir y adaptar los datos siempre que cites a OLAAC como fuente.

**Cita sugerida:**
> OLAAC — Observatorio Latinoamericano de Accesibilidad. (2026). *Datos de accesibilidad web en América Latina*. https://olaac.org/api/v1

## Contacto

- **Datos e investigación:** datos@olaac.org
- **Reportar un error en la API:** abre un ticket en https://olaac.org/tickets/nuevo
- **Repositorio:** https://github.com/olaac/webolaac
