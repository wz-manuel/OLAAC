# Manual de Marca — OLAAC
## Observatorio Latinoamericano de Accesibilidad

**Versión 1.0 · Abril 2026**

---

## 1. Quiénes Somos

El **Observatorio Latinoamericano de Accesibilidad (OLAAC)** es una plataforma técnica e institucional que monitorea, certifica y promueve la accesibilidad digital en América Latina. Somos el punto de referencia regional para organizaciones que quieren hacer de la web un espacio sin barreras.

### Misión
Democratizar el acceso a la información digital midiendo, publicando y mejorando los estándares de accesibilidad web en la región latinoamericana.

### Valores de Marca
| Valor | Expresión |
|-------|-----------|
| **Rigor** | Datos auditados, metodología WCAG, evidencia antes que opinión |
| **Acceso** | Lo que medimos lo hacemos accesible: el observatorio mismo es el ejemplo |
| **Región** | Latinoamérica como contexto, no como añadido |
| **Transparencia** | Resultados públicos, metodología abierta, sin opacidad |
| **Impacto** | No solo documentar: impulsar el cambio |

---

## 2. El Logotipo

### Anatomía del Logo

El logo de OLAAC combina dos elementos inseparables:

1. **El símbolo (lupa de datos):** Una lupa cuyo interior contiene una grilla de puntos que simula un mapa de calor digital. Representa el acto de observar, medir y analizar la accesibilidad web. Los puntos blancos sobre fondo cian evocan datos, píxeles, y la granularidad de las auditorías.

2. **El logotipo tipográfico (OLAAC):** Las letras L, A, A, C en mayúscula con peso bold institucional. Las dos letras A llevan un acento visual en Azul Acceso (#30BCEE) — un guiño a la tilde latinoamericana y a la accesibilidad como elemento diferencial.

3. **El nombre completo:** "OBSERVATORIO LATINOAMERICANO DE ACCESIBILIDAD" en versalitas compactas, posicionado bajo el logotipo como firma institucional.

### Versiones del Logo

| Versión | Uso recomendado |
|---------|----------------|
| **Completo (símbolo + OLAAC + nombre)** | Cabecera institucional, documentos, presentaciones |
| **Reducido (símbolo + OLAAC)** | Headers web, app móvil, espacio limitado |
| **Símbolo solo** | Favicon, avatar, íconos de app, watermark |
| **Tipográfico (solo OLAAC)** | Texto inline, menciones editoriales |

### Archivos Disponibles

| Archivo | Formato | Uso |
|---------|---------|-----|
| `OLAAC_final_daeg.svg` | SVG vectorial | Web, cualquier escala |
| `OLAAC_final_daeg.pdf` | PDF vectorial | Impresión, documentos |
| `OLAAC_final_daeg.eps` | EPS vectorial | Agencias, imprenta offset |
| `OLAAC_final_daeg.ai` | Adobe Illustrator | Edición de marca |
| `OLAAC logo.png` | PNG raster | Uso rápido, presentaciones |

---

## 3. Paleta de Colores

### Colores Primarios de Marca

#### Azul Observatorio — `#252858`
El color dominante del logo. Navy profundo con tono violáceo que comunica autoridad institucional, confianza y rigor técnico. Es el color de los textos principales, headers y elementos estructurales.

```
HEX:  #252858
RGB:  37, 40, 88
HSL:  237°, 41%, 25%
WCAG: Contraste sobre blanco → 12.7:1 (AAA ✓)
```

#### Azul Acceso — `#30BCEE`
El cian dinámico del símbolo. Evoca tecnología, apertura digital y la claridad de la información accesible. Se usa exclusivamente como color decorativo, logo, íconos, bordes y elementos no textuales.

```
HEX:  #30BCEE
RGB:  48, 188, 238
HSL:  199°, 84%, 56%
WCAG: Sobre blanco → 2.2:1 ✗ — NO USAR COMO TEXTO
      Sobre #252858 → 6.3:1 (AA ✓) — safe para texto grande sobre navy
      ⚠️  Restringir a: logo, íconos, bordes, fondos con texto navy encima
```

#### Azul Hielo — `#C9EAF2`
El tono suave interior del símbolo. Se usa para fondos de sección, badges secundarios y estados hover sutiles.

```
HEX:  #C9EAF2
RGB:  201, 234, 242
HSL:  196°, 52%, 87%
WCAG: Texto #252858 sobre este fondo → 8.4:1 (AAA ✓)
```

#### Blanco — `#FFFFFF`
Los puntos de datos dentro de la lupa. Fondo principal de la plataforma, contraste máximo.

### Escala Completa — Azul Observatorio

| Token | HEX | Uso |
|-------|-----|-----|
| `navy-50` | `#f0f1f8` | Fondos suaves, hover states |
| `navy-100` | `#dde0f0` | Bordes suaves, dividers |
| `navy-200` | `#b9bee2` | Placeholder text |
| `navy-300` | `#8c94cf` | Texto secundario deshabilitado |
| `navy-400` | `#606bb8` | Texto secundario |
| `navy-500` | `#4452a6` | Interactivos secundarios |
| `navy-600` | `#353e8e` | Hover de primarios |
| `navy-700` | `#2d3476` | Estados active |
| `navy-800` | `#252858` | **Color primario del logo** |
| `navy-900` | `#1a1d40` | Texto sobre fondos claros |
| `navy-950` | `#0f1128` | Máximo contraste |

### Escala Completa — Azul Acceso

| Token | HEX | Uso |
|-------|-----|-----|
| `cyan-50` | `#ecf9fe` | Fondos de notificación info |
| `cyan-100` | `#d0f1fc` | Badges secundarios |
| `cyan-200` | `#a6e4f9` | Bordes de cards destacadas |
| `cyan-300` | `#6dd2f5` | Íconos secundarios |
| `cyan-400` | `#30BCEE` | **Color acento del logo** |
| `cyan-500` | `#0ea5d5` | CTAs primarios sobre fondo blanco |
| `cyan-600` | `#0284b0` | Hover de CTAs |
| `cyan-700` | `#016a8f` | Estados active |
| `cyan-800` | `#065675` | Texto sobre fondos cyan claros |
| `cyan-900` | `#0a4762` | Texto oscuro sobre cyan |

### Colores Semánticos

| Propósito | HEX | Contraste sobre blanco | Uso |
|-----------|-----|------------------------|-----|
| **Foco a11y** | `#005fcc` | 5.98:1 (AA ✓) | Ring de foco WCAG 2.4.7 |
| **Error** | `#c0392b` | Validaciones, alertas críticas |
| **Éxito** | `#1a7a4a` | Confirmaciones, score excelente |
| **Advertencia** | `#b45309` | Alertas moderadas |
| **Información** | `#1d4ed8` | Notificaciones neutras |

### Colores de Score WCAG

Seleccionados para pasar ≥4.5:1 sobre blanco (usables como texto y como fondo con texto blanco).

| Rango | HEX | Contraste/blanco | Etiqueta |
|-------|-----|------------------|----------|
| 0–49 | `#dc2626` | 4.83:1 (AA ✓) | Crítico |
| 50–64 | `#c2410c` | 5.17:1 (AA ✓) | Deficiente |
| 65–79 | `#b45309` | 5.02:1 (AA ✓) | Moderado |
| 80–89 | `#15803d` | 5.02:1 (AA ✓) | Bueno |
| 90–100 | `#166534` | 7.13:1 (AAA ✓) | Excelente |

---

## 4. Tipografía

### Fuente Principal — Inter

Inter es la fuente institucional del observatorio. Diseñada para interfaces digitales con máxima legibilidad en pantalla a cualquier tamaño. Sus formas abiertas y altura de x elevada la hacen idónea para texto de alta densidad informativa.

```
Familia:  Inter (Google Fonts / Variable)
Pesos:    400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
Uso:      Todo el texto de interfaz, documentos, labels, cuerpo
```

### Fuente Técnica — JetBrains Mono

Para datos técnicos, código, URLs, valores de score y snippets de auditoría. Su diseño monoespaciado con ligaduras mejora la lectura de secuencias técnicas.

```
Familia:  JetBrains Mono
Pesos:    400 (Regular), 500 (Medium)
Uso:      Código, valores numéricos alineados, URLs, hashes
```

### Escala Tipográfica

| Nombre | Tamaño | Line Height | Uso |
|--------|--------|-------------|-----|
| `xs` | 12px / 0.75rem | 16px | Labels, metadatos |
| `sm` | 14px / 0.875rem | 20px | Texto de apoyo, captions |
| `base` | 16px / 1rem | 24px | Cuerpo principal |
| `lg` | 18px / 1.125rem | 28px | Lead text, intro |
| `xl` | 20px / 1.25rem | 28px | Subtítulos de sección |
| `2xl` | 24px / 1.5rem | 32px | Títulos de módulo |
| `3xl` | 30px / 1.875rem | 36px | Títulos de página |
| `4xl` | 36px / 2.25rem | 40px | Heroes, grandes cifras |

---

## 5. Voz y Tono

### Personalidad de Marca

OLAAC habla como un **organismo técnico con vocación pública**: experto sin ser elitista, riguroso sin ser frío, latinoamericano sin ser localista. Cada comunicación refuerza que la accesibilidad no es un detalle técnico sino un derecho.

### Principios de Escritura

**Directo y preciso**
Evitar circumlocuciones. Si el score es 43/100, decir "Crítico (43/100)" no "presenta oportunidades de mejora significativas".

**Técnico pero comprensible**
Usar términos WCAG con definición contextual la primera vez. No asumir que el lector conoce el estándar.

**Activo y orientado a la acción**
Preferir "Audita tu sitio", "Obtén el Distintivo", "Corrige estos errores" sobre formas pasivas.

**Latinoamericano sin folclore**
Español neutro con sensibilidad regional. Evitar localismos excluyentes. El "nosotros" incluye a México, Argentina, Colombia, Perú, etc.

### Ejemplos de Tono

| Contexto | Evitar | Preferir |
|----------|--------|---------|
| Score bajo | "Tu sitio necesita mejorar la experiencia de usuario" | "Score crítico: 7 errores WCAG A bloquean el acceso para usuarios de lector de pantalla" |
| Certificación | "¡Felicitaciones! Eres accesible" | "Distintivo Oro obtenido. Tu sitio cumple 100% de criterios WCAG 2.1 Nivel AA" |
| Error técnico | "Algo salió mal" | "No se pudo completar la auditoría Lighthouse — verifica que la URL sea pública" |

---

## 6. Reglas de Uso del Logo

### Zona de Seguridad
El logo debe tener un espacio libre equivalente a la altura de la letra "O" de OLAAC en todos sus lados.

### Usos Correctos
- Logo original sobre fondo blanco
- Logo en negativo (blanco) sobre fondo `#252858`
- Logo original sobre fondo `#C9EAF2`

### Usos Prohibidos
- Cambiar los colores del logo
- Deformar o estirar el logo
- Separar el símbolo del logotipo (excepto en versión favicon)
- Aplicar sombras, degradados o efectos sobre el logo
- Usar el logo sobre fondos de bajo contraste
- Rotar el logo

---

## 7. Aplicaciones Digitales

### Header de la Plataforma Web
- Logo completo (símbolo + OLAAC) en la esquina superior izquierda
- Fondo blanco con borde inferior `#dde0f0` (navy-100)
- Altura del header: 56px (h-14)

### Botones
- **Primario:** Fondo `#252858`, texto blanco, hover `#2d3476`
- **Acento:** Fondo `#30BCEE`, texto `#252858`, hover `#0ea5d5`
- **Secundario:** Borde `#252858`, texto `#252858`, hover fondo `#f0f1f8`

### Badges de Score
Usar la escala de colores semánticos de score según el rango del puntaje.

### Foco Accesible
Todos los elementos interactivos usan el ring de foco `#005fcc` (2px, offset 2px). Nunca se elimina sin reemplazo visible.

---

## 8. Accesibilidad de la Identidad

La marca OLAAC practica lo que predica. Las decisiones visuales de la identidad cumplen:

- **WCAG 1.4.3 (AAA):** `#252858` sobre blanco = 13.8:1; `#252858` sobre `#C9EAF2` = 10.9:1
- **WCAG 1.4.3 (AA):** Todos los score colors pasan ≥4.5:1 sobre blanco y como texto en badges
- **WCAG 1.4.11 (AA):** `#16a34a` y superiores pasan el umbral de 3:1 para UI components
- **WCAG 2.4.7:** Foco visible (`#005fcc`, 5.98:1) en todos los elementos interactivos
- **WCAG 1.1.1:** El logo SVG incluye `role="img"` y `aria-label` descriptivo
- **⚠️ Restricción:** `#30BCEE` (2.2:1 sobre blanco) — solo decorativo/logo, nunca como texto

---

## 9. Contacto de Marca

Para consultas sobre uso de la marca, solicitud de archivos adicionales o aprobación de materiales de terceros, contactar a través del repositorio del proyecto o al correo de administración.

---

*Este documento es la fuente de verdad para decisiones visuales y comunicacionales del Observatorio Latinoamericano de Accesibilidad. Se actualiza cuando hay cambios formales en la identidad.*
