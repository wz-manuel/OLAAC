-- =============================================================
-- OLAAC — Seed: Curso de muestra "Introducción a la Accesibilidad Digital"
-- =============================================================

-- IDs fijos para referencias cruzadas predecibles
DO $$
DECLARE
  curso_id   uuid := 'c0a11ac0-0000-0000-0000-000000000001';
  lesson1_id uuid := 'c0a11ac0-0000-0000-0001-000000000001';
  lesson2_id uuid := 'c0a11ac0-0000-0000-0002-000000000001';
  lesson3_id uuid := 'c0a11ac0-0000-0000-0003-000000000001';
BEGIN

-- Curso principal
INSERT INTO courses (id, slug, titulo, descripcion, published)
VALUES (
  curso_id,
  'introduccion-a-la-accesibilidad-digital',
  'Introducción a la Accesibilidad Digital',
  'Aprende los fundamentos de la accesibilidad digital: qué es, por qué importa, qué dice la normativa WCAG y cómo auditar un sitio con herramientas gratuitas.',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Lección 1 — ¿Qué es la accesibilidad digital?
INSERT INTO lessons (id, course_id, titulo, tipo, contenido, orden, duracion_min, published)
VALUES (
  lesson1_id, curso_id,
  '¿Qué es la accesibilidad digital?',
  'lectura',
  E'## ¿Qué es la accesibilidad digital?\n\nLa **accesibilidad digital** es la práctica de diseñar y desarrollar tecnología de forma que pueda ser utilizada por el mayor número posible de personas, incluyendo aquellas con discapacidades visuales, auditivas, motoras o cognitivas.\n\n> "La accesibilidad web significa que los sitios web, las herramientas y las tecnologías están diseñados y desarrollados para que las personas con discapacidad puedan usarlos." — W3C WAI\n\n## ¿A quién beneficia la accesibilidad?\n\nAunque pensamos en personas con discapacidad permanente, la accesibilidad ayuda a una audiencia mucho más amplia:\n\n- **Permanente**: ceguera, sordera, parálisis\n- **Temporal**: brazo fracturado, infección ocular\n- **Situacional**: luz solar intensa, manos ocupadas, entorno ruidoso\n\nEl principio del **diseño universal** dice: lo que beneficia a quienes tienen barreras, mejora la experiencia de todos.\n\n## Datos que importan\n\nSegún la Organización Mundial de la Salud:\n\n- Más de **1,300 millones** de personas viven con algún tipo de discapacidad.\n- Representan el **16%** de la población mundial.\n- En Latinoamérica, la mayoría de los sitios web gubernamentales no cumplen el nivel mínimo de accesibilidad.\n\n## Dimensiones de la accesibilidad\n\n### Accesibilidad web\nSitios, aplicaciones y documentos digitales que funcionan con tecnologías asistivas: lectores de pantalla, control por voz, teclados alternativos.\n\n### Accesibilidad en aplicaciones móviles\nInterfaces táctiles con suficiente área de toque, contraste adecuado y compatibilidad con VoiceOver o TalkBack.\n\n### Documentos accesibles\nPDFs con estructura, etiquetas y texto alternativo en imágenes.\n\n## ¿Por qué es un derecho, no solo una buena práctica?\n\nLa accesibilidad está reconocida en:\n\n- **Convención de la ONU sobre los Derechos de las Personas con Discapacidad (CRPD)** — firmada por la mayoría de países latinoamericanos.\n- Legislación local en México (Ley Federal para Prevenir y Eliminar la Discriminación), Colombia, Argentina y otros.\n- Normativas de contratación pública que exigen cumplimiento WCAG en portales de gobierno.\n\n## Resumen de la lección\n\nLa accesibilidad digital es un derecho y una responsabilidad compartida entre diseñadores, desarrolladores y tomadores de decisiones. En la siguiente lección aprenderemos el estándar internacional que define cómo medirla y cumplirla.',
  1, 10, true
)
ON CONFLICT (id) DO NOTHING;

-- Lección 2 — Las WCAG: principios y niveles de conformidad
INSERT INTO lessons (id, course_id, titulo, tipo, contenido, orden, duracion_min, published)
VALUES (
  lesson2_id, curso_id,
  'Las WCAG: principios y niveles de conformidad',
  'lectura',
  E'## ¿Qué son las WCAG?\n\nLas **Web Content Accessibility Guidelines (WCAG)** son las pautas internacionales de accesibilidad para contenido web, desarrolladas por el **W3C** (World Wide Web Consortium) a través de su iniciativa WAI.\n\nActualmente la versión vigente recomendada es **WCAG 2.2** (publicada en 2023), aunque WCAG 2.1 sigue siendo el mínimo legal en muchos países.\n\n## Los 4 principios POUR\n\nToda la normativa WCAG se organiza en cuatro principios fundamentales:\n\n### 1. Perceptible\nLa información debe presentarse de formas que el usuario pueda percibir. Nadie debe ser excluido porque no puede ver o escuchar el contenido.\n\n**Ejemplos:**\n- Texto alternativo en imágenes\n- Subtítulos en videos\n- Contraste de colores suficiente\n\n### 2. Operable\nLos componentes de la interfaz deben ser operables. El usuario debe poder navegar y usar el sitio sin depender exclusivamente del ratón.\n\n**Ejemplos:**\n- Navegación completa por teclado\n- Sin límites de tiempo que excluyan usuarios lentos\n- No hay contenido que provoque convulsiones (destellos)\n\n### 3. Comprensible\nEl contenido y la interfaz deben ser comprensibles. El usuario debe entender la información y cómo funciona la interfaz.\n\n**Ejemplos:**\n- Idioma de la página declarado en el HTML\n- Mensajes de error claros y descriptivos\n- Comportamiento predecible al enfocar elementos\n\n### 4. Robusto\nEl contenido debe ser lo suficientemente robusto para ser interpretado por tecnologías asistivas actuales y futuras.\n\n**Ejemplos:**\n- HTML válido y semántico\n- Roles ARIA correctamente implementados\n- Nombres accesibles en todos los controles\n\n## Los 3 niveles de conformidad\n\n| Nivel | Descripción | Aplicación |\n|-------|-------------|------------|\n| **A** | Mínimo absoluto. Sin esto, el sitio es inutilizable para grupos de usuarios. | Obligatorio siempre |\n| **AA** | Elimina las barreras más significativas. Requerido por la mayoría de legislaciones. | Objetivo estándar |\n| **AAA** | Máximo nivel. No siempre aplicable a todo el contenido. | Aspiracional |\n\n> **Regla práctica**: apunta al nivel AA. Es el estándar legal en la mayoría de países y el que evalúan los auditores.\n\n## Criterios de éxito clave (nivel AA)\n\n- **1.4.3 Contraste de texto**: mínimo 4.5:1 para texto normal, 3:1 para texto grande.\n- **1.1.1 Contenido no textual**: todas las imágenes con `alt` descriptivo.\n- **2.1.1 Teclado**: toda funcionalidad accesible por teclado.\n- **2.4.7 Foco visible**: el indicador de foco debe ser siempre visible.\n- **3.3.1 Identificación de errores**: los errores de formulario deben describirse en texto.\n\n## WCAG en Latinoamérica\n\nPaíses con normativa que referencia WCAG:\n\n- 🇲🇽 **México** — Acuerdo de gobierno digital exige WCAG 2.1 AA en portales gubernamentales\n- 🇨🇴 **Colombia** — NTC 5854 basada en WCAG\n- 🇦🇷 **Argentina** — Resolución 69/2011 y Ley 26.653\n- 🇨🇱 **Chile** — Norma Chilena 2626 basada en WCAG 1.0 (en actualización)\n\n## Resumen de la lección\n\nLas WCAG definen qué significa ser accesible a través de 4 principios (POUR) y 3 niveles (A, AA, AAA). En la próxima lección pondremos esto en práctica con herramientas que permiten detectar barreras automáticamente.',
  2, 15, true
)
ON CONFLICT (id) DO NOTHING;

-- Lección 3 — Herramientas para auditar la accesibilidad
INSERT INTO lessons (id, course_id, titulo, tipo, contenido, orden, duracion_min, published)
VALUES (
  lesson3_id, curso_id,
  'Herramientas para auditar la accesibilidad',
  'ejercicio',
  E'## Herramientas de auditoría automática\n\nLas herramientas automáticas detectan entre el **30% y el 40%** de los problemas de accesibilidad. Son el primer paso, no el único. Siempre deben complementarse con revisión manual y pruebas con usuarios reales.\n\n## 1. axe DevTools\n\n**Tipo**: Extensión de navegador | **Precio**: Gratuito (con versión Pro)\n\naxe es el motor de accesibilidad más usado en la industria. Lo usan equipos en Microsoft, Google y Deque.\n\n**Cómo usarlo:**\n1. Instala la extensión para [Chrome](https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnindnejefpokejbdd) o Firefox.\n2. Abre las DevTools del navegador (F12).\n3. Ve a la pestaña **axe DevTools**.\n4. Haz clic en **Scan ALL of my page**.\n5. Revisa los resultados clasificados por impacto: critical, serious, moderate, minor.\n\n**Ventaja clave**: cero falsos positivos en la versión gratuita. Cada resultado que muestra es un problema real.\n\n## 2. WAVE\n\n**Tipo**: Extensión de navegador | **Precio**: Gratuito\n\nWAVE (Web Accessibility Evaluation Tool) de WebAIM visualiza los problemas directamente sobre la página, lo que lo hace muy intuitivo para comenzar.\n\n**Cómo usarlo:**\n1. Instala WAVE para [Chrome](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh).\n2. Navega a la página que quieres evaluar.\n3. Haz clic en el ícono de WAVE.\n4. Observa los íconos superpuestos: rojo = error, amarillo = alerta, verde = OK.\n\n**Ventaja clave**: permite evaluar páginas con login o en localhost, sin enviar datos al servidor.\n\n## 3. Lighthouse\n\n**Tipo**: Integrado en Chrome DevTools | **Precio**: Gratuito\n\nLighthouse es la herramienta de Google para medir calidad web. Además de accesibilidad evalúa rendimiento, SEO y buenas prácticas.\n\n**Cómo usarlo:**\n1. Abre Chrome DevTools (F12).\n2. Ve a la pestaña **Lighthouse**.\n3. Selecciona **Accessibility** (puedes desmarcar las demás).\n4. Haz clic en **Analyze page load**.\n5. Observa el score del 0 al 100 y la lista de auditorías.\n\n**Ventaja clave**: genera un score numérico fácil de reportar y comparar en el tiempo.\n\n## Ejercicio práctico\n\nSigue estos pasos para tu primera auditoría:\n\n### Paso 1: Elige un sitio\nElige cualquier sitio web público — puede ser el de tu municipio, tu universidad o una tienda en línea.\n\n### Paso 2: Ejecuta axe DevTools\n- Instala la extensión\n- Escanea la página de inicio\n- Anota cuántos errores críticos encuentras\n\n### Paso 3: Ejecuta Lighthouse\n- Analiza la misma URL\n- Registra el score de accesibilidad\n- Identifica los 3 errores con mayor impacto\n\n### Paso 4: Compara resultados\naxe y Lighthouse no siempre detectan los mismos problemas. ¿Qué encontró cada uno que el otro no?\n\n### Paso 5: Documenta\nCrea una tabla simple:\n\n| Herramienta | Errores encontrados | Score | Error más crítico |\n|-------------|--------------------:|------:|-------------------|\n| axe DevTools | ? | — | ? |\n| Lighthouse | ? | ?/100 | ? |\n\n## Limitaciones de las herramientas automáticas\n\nLas herramientas automáticas **no pueden detectar**:\n\n- Si el texto alternativo de una imagen es descriptivo y útil (solo detecta que existe)\n- Si el orden de foco es lógico para el flujo de la página\n- Si el contenido es comprensible para personas con discapacidad cognitiva\n- La experiencia real de un usuario con lector de pantalla\n\nPor eso, la auditoría manual y las pruebas con usuarios son siempre el paso siguiente.\n\n## Resumen del curso\n\n¡Felicitaciones! Completaste el curso **Introducción a la Accesibilidad Digital**.\n\nAprendiste:\n\n✓ Qué es la accesibilidad digital y a quién beneficia  \n✓ Los 4 principios WCAG (POUR) y los 3 niveles de conformidad  \n✓ Cómo usar axe DevTools, WAVE y Lighthouse para detectar barreras\n\n**Próximos pasos recomendados:**\n- Realiza una auditoría completa de un sitio real\n- Explora los cursos avanzados de OLAAC sobre remediación y ARIA\n- Únete a la comunidad de Embajadores de Accesibilidad',
  3, 20, true
)
ON CONFLICT (id) DO NOTHING;

END $$;
