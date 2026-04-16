# Estrategia SEO — boxtocuba-landing

Documentación de la estrategia SEO por fases, convenciones técnicas y elementos implementados.

---

## Configuración base

```js
// astro.config.mjs
export default defineConfig({
  site: 'https://boxtocuba.ca',   // siempre el dominio de producción
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es', fr: 'fr' },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    routing: { prefixDefaultLocale: false },  // EN sin /en/, ES con /es/, FR con /fr/
  },
});
```

> `site` **siempre** debe apuntar a producción (`boxtocuba.ca`), nunca al dominio de staging. Es el valor que usa el sitemap y los schemas JSON-LD para construir URLs absolutas.

---

## Sitemap

Generado automáticamente por `@astrojs/sitemap` en cada build:

| Archivo | Propósito |
|---------|----------|
| `/sitemap-index.xml` | Índice del sitemap — URL que se registra en Google Search Console |
| `/sitemap-0.xml` | Lista de todas las URLs con sus alternates hreflang |

El sitemap es referenciado en `robots.txt`:
```
Sitemap: https://boxtocuba.ca/sitemap-index.xml
```

Y `@astrojs/sitemap` inyecta automáticamente en el `<head>` de cada página:
```html
<link rel="sitemap" href="/sitemap-index.xml" />
```

Para registrar en Google Search Console: usar la URL `https://boxtocuba.ca/sitemap-index.xml`.

---

## hreflang

Cada página declara sus alternativas de idioma. Las páginas internas (provincias, rates, etc.) usan la prop `alternates` de `BaseLayout.astro`:

```astro
<BaseLayout
  alternates={[
    { hreflang: 'en', href: 'https://boxtocuba.ca/provinces/la-habana/' },
    { hreflang: 'es', href: 'https://boxtocuba.ca/es/provincias/la-habana/' },
    { hreflang: 'fr', href: 'https://boxtocuba.ca/fr/provinces/la-habana/' },
    { hreflang: 'x-default', href: 'https://boxtocuba.ca/provinces/la-habana/' },
  ]}
/>
```

Las homepages usan el comportamiento por defecto del layout (apuntan a `/`, `/es/`, `/fr/`).

---

## Schema markup (JSON-LD)

### FAQPage — páginas de contenido

Las páginas de rates, customs guide y prohibited items incluyen un schema `FAQPage`:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does shipping take?",
      "acceptedAnswer": { "@type": "Answer", "text": "..." }
    }
  ]
}
```

### Service — páginas de provincias

Cada una de las 48 páginas de provincia tiene un schema `Service` único:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Box to Cuba — Shipping to La Habana",
  "serviceType": "International Parcel Shipping",
  "areaServed": {
    "@type": "State",
    "name": "La Habana",
    "containedInPlace": { "@type": "Country", "name": "Cuba" }
  },
  "provider": {
    "@type": "Organization",
    "name": "Box to Cuba",
    "url": "https://boxtocuba.ca"
  }
}
```

El campo `areaServed` es diferente en cada página — clave para que Google entienda que son páginas distintas y no contenido duplicado.

---

## Fases SEO

### Phase 1 — Fundamentos técnicos ✅
- `robots.txt` con `Sitemap:` directive
- OG image fallback (`/og-image.jpg`)
- `@astrojs/sitemap` configurado con i18n
- FAQPage schema en páginas de contenido

### Phase 2 — Páginas de contenido ✅

9 páginas de contenido en 3 idiomas:

| EN | ES | FR |
|----|----|----|
| `/canada-to-cuba-shipping-rates/` | `/es/precios-envio-canada-cuba/` | `/fr/tarifs-envoi-canada-cuba/` |
| `/cuba-customs-guide/` | `/es/guia-aduana-cuba/` | `/fr/guide-douanes-cuba/` |
| `/cuba-prohibited-items/` | `/es/articulos-prohibidos-cuba/` | `/fr/articles-interdits-cuba/` |

Estrategia de diferenciación: contenido específico, FAQs únicas, schema FAQPage, hreflang correcto.

### Phase 3 — Páginas de provincias cubanas ✅

48 páginas estáticas (16 provincias × 3 idiomas). Ver [`docs/provinces.md`](provinces.md) para detalles técnicos.

Estrategia de diferenciación por página:
- Lista de municipios reales (8–15 por provincia)
- Descripción única de 2–3 oraciones
- FAQs específicas de la provincia (no genéricas)
- Schema JSON-LD Service con `areaServed` único
- hreflang alternates correctos entre las 3 versiones

### Phase 4 — Páginas de ciudades canadienses 🔜

Páginas por ciudad de origen en Canadá (Toronto, Montreal, Vancouver, etc.):
- `/ship-from-toronto-to-cuba/`
- `/es/enviar-desde-toronto-a-cuba/`
- `/fr/envoyer-de-toronto-a-cuba/`

Misma arquitectura que las páginas de provincias: `src/data/cities.ts` como fuente de verdad, rutas dinámicas, schema Service con `areaServed` = ciudad canadiense.

### Phase 5 — Blog 🔜

Blog multiidioma con artículos sobre:
- Guías de envío (qué se puede mandar, cómo empacar)
- Regulaciones aduaneras actualizadas
- Noticias de vuelos y rutas
- Comparativas de precios

Arquitectura propuesta: colección de contenido Astro (`src/content/blog/`) o CMS externo (Sanity, Contentful).

---

## Convenciones

### Títulos de página
Formato: `{Tema específico} | Box to Cuba`

Ejemplos:
- `Ship to La Habana, Cuba from Canada | Box to Cuba`
- `Canada to Cuba Shipping Rates 2026 | Box to Cuba`

### Meta descriptions
- Longitud: 140–160 caracteres
- Incluir: servicio, origen (Canadá), destino (Cuba/provincia), call to action
- Evitar: texto genérico que aplique a cualquier página

### URLs
- Siempre en minúsculas con guiones (`-`), nunca underscores
- Sin parámetros de query para contenido indexable
- Trailing slash consistente (Astro lo maneja automáticamente)

### Imágenes
- Siempre incluir `alt` descriptivo
- `loading="eager"` solo para imágenes above-the-fold (hero)
- `loading="lazy"` para el resto (Astro default)
- Comprimir a < 200KB antes de commitear al repo

---

## Checklist al agregar una página nueva

- [ ] `<title>` único y descriptivo (formato: `{tema} | Box to Cuba`)
- [ ] `<meta name="description">` de 140–160 caracteres
- [ ] OG tags (`og:title`, `og:description`, `og:image`)
- [ ] hreflang alternates (EN/ES/FR + x-default)
- [ ] Schema JSON-LD apropiado (FAQPage, Service, Organization)
- [ ] La página aparece en el sitemap (verificar `/sitemap-0.xml` tras el build)
- [ ] `robots.txt` no la excluye
