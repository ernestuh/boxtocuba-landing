# Sistema de páginas de provincias cubanas

48 páginas estáticas (16 provincias × 3 idiomas) generadas automáticamente desde una única fuente de verdad: `src/data/provinces.ts`.

---

## Arquitectura

```
src/data/provinces.ts          ← fuente de verdad
        │
        ├── src/pages/provinces/[province].astro          → /provinces/{slug}/
        ├── src/pages/es/provincias/[province].astro      → /es/provincias/{slug}/
        └── src/pages/fr/provinces/[province].astro       → /fr/provinces/{slug}/

        ├── src/pages/index.astro                         → cards de provincias linkables
        ├── src/pages/es/index.astro                      → ídem en ES
        ├── src/pages/fr/index.astro                      → ídem en FR

        ├── src/pages/canada-to-cuba-shipping-rates.astro → tabla con links y notices
        ├── src/pages/es/precios-envio-canada-cuba.astro  → ídem en ES
        └── src/pages/fr/tarifs-envoi-canada-cuba.astro   → ídem en FR
```

---

## `src/data/provinces.ts` — interfaz completa

```typescript
export type PriceGroup = 'western' | 'matanzas' | 'central-eastern';

export interface Province {
  slug: string;          // URL-safe, usado en getStaticPaths()
  name: string;          // Nombre en inglés (también nombre oficial en ES)
  name_es: string;       // Nombre en español
  name_fr: string;       // Nombre en francés
  capital?: string;      // Solo si la capital ≠ nombre de la provincia (ej. Granma → Bayamo)

  priceFrom: string;     // Precio mínimo en inglés (ej. "$75 CAD")
  priceFrom_es: string;  // ídem en español
  priceFrom_fr: string;  // ídem en francés
  priceGroup: PriceGroup;

  delivery_en: string;   // Descripción de entrega en inglés
  delivery_es: string;   // ídem en español
  delivery_fr: string;   // ídem en francés

  note_en?: string;      // Nota opcional (ej. aviso de servicio limitado)
  note_es?: string;
  note_fr?: string;

  municipalities: string[];    // Lista de municipios (8–15 por provincia)

  description_en: string;      // 2–3 oraciones únicas para SEO
  description_es: string;
  description_fr: string;

  faq_en: { q: string; a: string }[];   // 3–5 preguntas únicas por provincia
  faq_es: { q: string; a: string }[];
  faq_fr: { q: string; a: string }[];

  relatedSlugs: string[];      // Otras provincias relacionadas (para linking interno)
}
```

### Caso especial: Granma

Granma es la única provincia donde la capital (`Bayamo`) no coincide con el nombre de la provincia. El campo `capital?: string` solo se define para este caso:

```typescript
{
  slug: 'granma',
  name: 'Granma',
  capital: 'Bayamo',   // ← usado en notices "capital_only" en lugar de "Granma"
  ...
}
```

En las páginas de provincia:
```astro
const capitalCity = p.capital ?? p.name; // "Bayamo" para Granma, nombre de provincia para el resto
```

---

## Grupos de precio (`PriceGroup`)

| Grupo | Provincias | Descripción |
|-------|-----------|-------------|
| `western` | La Habana, Artemisa, Mayabeque, Pinar del Río, Isla de la Juventud | Zona occidental — acceso directo desde aeropuerto de La Habana |
| `matanzas` | Matanzas | Zona central-oeste |
| `central-eastern` | Villa Clara, Cienfuegos, Sancti Spíritus, Ciego de Ávila, Camagüey, Las Tunas, Holguín, Granma, Santiago de Cuba, Guantánamo | Zona central y oriental |

---

## Generación estática con `getStaticPaths()`

Las 3 plantillas dinámicas usan el mismo patrón:

```astro
---
import { provinceData } from '../../data/provinces';
import { getNotice, getProvinceNoticeType } from '../../lib/cms';

export async function getStaticPaths() {
  return provinceData.map(p => ({
    params: { province: p.slug },
    props: { province: p },
  }));
}

const { province: p } = Astro.props;
const notice = await getNotice();
const noticeType = getProvinceNoticeType(notice, p.slug);
const capitalCity = p.capital ?? p.name; // EN
---
```

Resultado: Astro genera una página por cada entrada en `provinceData` (16 páginas por plantilla × 3 = **48 páginas**).

---

## Rutas generadas

| Plantilla | Ruta generada | Ejemplo |
|-----------|--------------|---------|
| `provinces/[province].astro` | `/provinces/{slug}/` | `/provinces/la-habana/` |
| `es/provincias/[province].astro` | `/es/provincias/{slug}/` | `/es/provincias/la-habana/` |
| `fr/provinces/[province].astro` | `/fr/provinces/{slug}/` | `/fr/provinces/la-habana/` |

---

## SEO por página de provincia

Cada página tiene elementos únicos para evitar contenido duplicado:

### hreflang alternates

Cada página de provincia declara sus 3 alternativas de idioma mediante la prop `alternates` de `BaseLayout.astro`:

```astro
<BaseLayout
  alternates={[
    { hreflang: 'en', href: `https://boxtocuba.ca/provinces/${p.slug}/` },
    { hreflang: 'es', href: `https://boxtocuba.ca/es/provincias/${p.slug}/` },
    { hreflang: 'fr', href: `https://boxtocuba.ca/fr/provinces/${p.slug}/` },
    { hreflang: 'x-default', href: `https://boxtocuba.ca/provinces/${p.slug}/` },
  ]}
>
```

### JSON-LD Service schema

Cada página incluye un schema único con `areaServed` diferenciado:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Box to Cuba — Shipping to La Habana",
  "areaServed": {
    "@type": "State",
    "name": "La Habana",
    "containedInPlace": { "@type": "Country", "name": "Cuba" }
  },
  "provider": { "@type": "Organization", "name": "Box to Cuba" }
}
```

### Contenido único por provincia

- **Descripción**: 2–3 oraciones específicas de la provincia (campo `description_en/es/fr`)
- **Municipios**: lista de 8–15 municipios reales de la provincia
- **FAQs**: 3–5 preguntas y respuestas específicas (no genéricas)
- **Provincias relacionadas**: sección "También enviamos a..." con links internos

---

## Sistema de notices por provincia

Las páginas de provincia muestran banners de aviso condicionales basados en el valor de `LANDING_NOTICE` en Supabase:

| `noticeType` | Banner | Color |
|-------------|--------|-------|
| `'capital_only'` | "Delivery is temporarily limited to {capitalCity} only..." | Amber ⚠️ |
| `'pickup_havana'` | "Package held at our La Habana office for pickup..." | Orange 📍 |
| `'pickup_santiago'` | "Package can be sent to Santiago de Cuba for pickup..." | Red 🚫 |
| `null` | Sin banner | — |

Los banners aparecen entre el breadcrumb y el hero de la página. Se activan/desactivan desde el dashboard sin necesidad de tocar el código.

---

## Integración en páginas de tarifas

La tabla de tarifas (`canada-to-cuba-shipping-rates.astro` y equivalentes ES/FR) también usa `provinceData`:

- El nombre de cada provincia es un link a su página: `/provinces/{slug}/`
- Cada fila tiene un borde izquierdo de color si hay notice activo
- Al final de la tabla aparecen footnotes condicionales (`hasCapitalOnly`, `hasPickupHavana`, `hasPickupSantiago`)

---

## Cómo agregar una provincia nueva

1. Agregar una entrada al array `provinceData` en `src/data/provinces.ts` con todos los campos obligatorios
2. Hacer build — las 3 rutas dinámicas la incluirán automáticamente
3. Las homepages y páginas de tarifas la mostrarán automáticamente
4. No se requiere ningún otro cambio

---

## Las 16 provincias

| Slug | Nombre | Grupo de precio |
|------|--------|----------------|
| `la-habana` | La Habana | western |
| `artemisa` | Artemisa | western |
| `mayabeque` | Mayabeque | western |
| `pinar-del-rio` | Pinar del Río | western |
| `isla-de-la-juventud` | Isla de la Juventud | western |
| `matanzas` | Matanzas | matanzas |
| `villa-clara` | Villa Clara | central-eastern |
| `cienfuegos` | Cienfuegos | central-eastern |
| `sancti-spiritus` | Sancti Spíritus | central-eastern |
| `ciego-de-avila` | Ciego de Ávila | central-eastern |
| `camaguey` | Camagüey | central-eastern |
| `las-tunas` | Las Tunas | central-eastern |
| `holguin` | Holguín | central-eastern |
| `granma` | Granma (capital: Bayamo) | central-eastern |
| `santiago-de-cuba` | Santiago de Cuba | central-eastern |
| `guantanamo` | Guantánamo | central-eastern |
