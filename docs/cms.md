# Sistema CMS — boxtocuba-landing

El contenido del sitio es gestionado desde el panel de administración del dashboard (`app.boxtocuba.ca`) y se almacena en la tabla `settings` de Supabase. El sitio Astro lo lee en **build time** y genera HTML estático.

---

## Arquitectura

```
Dashboard (React)
  └── LandingAdmin.tsx
        ├── Editar sección → PUT settings (key, value)
        ├── Save → LANDING_PENDING_CHANGES = 'true'
        └── Publish → POST Vercel Deploy Webhook
                            │
                            ▼
                    Vercel rebuild
                            │
                            ▼
                    Astro build time
                    └── getCmsContent(lang)
                          ├── Fetch settings WHERE key LIKE 'LANDING_{LANG}_%'
                          ├── Merge sobre JSON fallback (src/i18n/*.json)
                          └── t(content, 'hero.headline') → valor final
                                    │
                                    ▼
                            HTML estático generado
                            Sitio live en boxtocuba.ca
```

> El sitio en producción es **HTML puro**. Supabase no recibe ninguna llamada en runtime — solo en cada rebuild de Vercel.

---

## Claves en la tabla `settings`

### Claves de contenido

Formato: `LANDING_{LANG}_{SECTION}` donde `LANG` es `EN`, `ES` o `FR`.

| Clave | Idioma | Sección | Tipo de valor |
|-------|--------|---------|---------------|
| `LANDING_EN_META` | Inglés | SEO meta tags | Objeto plano |
| `LANDING_EN_HERO` | Inglés | Hero principal | Objeto plano |
| `LANDING_EN_CUBA_BANNER` | Inglés | Banner Cuba | Objeto plano |
| `LANDING_EN_FEATURES` | Inglés | Características | Array de cards |
| `LANDING_EN_HOW_IT_WORKS` | Inglés | Cómo funciona | Array de pasos |
| `LANDING_EN_FAQ` | Inglés | Preguntas frecuentes | Array de items |
| `LANDING_EN_CONTACT` | Inglés | Contacto | Objeto plano |
| `LANDING_EN_FOOTER` | Inglés | Pie de página | Objeto plano |
| `LANDING_ES_*` | Español | (mismas 8 secciones) | — |
| `LANDING_FR_*` | Francés | (mismas 8 secciones) | — |

**Total: 24 claves de contenido** (8 secciones × 3 idiomas)

### Claves de control

| Clave | Propósito | Valor |
|-------|----------|-------|
| `LANDING_NOTICE` | Avisos de servicio por provincia | JSON (ver abajo) |
| `LANDING_PENDING_CHANGES` | Hay cambios guardados no publicados | `'true'` / `'false'` |
| `LANDING_PENDING_SECTIONS` | Lista de cambios pendientes con diff | JSON array |
| `LANDING_VERCEL_WEBHOOK` | URL del webhook de deploy de Vercel | URL string |

---

## Estructura JSON por sección

### META (objeto plano)
```json
{
  "title": "Box to Cuba — Ship Packages from Canada to Cuba",
  "description": "Fast, reliable parcel shipping from Canada to all Cuban provinces.",
  "og_title": "Box to Cuba — Trusted shipping",
  "og_description": "Send packages to Cuba from Canada."
}
```

### HERO (objeto plano)
```json
{
  "badge": "✈️ Weekly flights to Cuba",
  "headline": "Send love from Canada to Cuba",
  "subtitle": "Fast, reliable, and affordable parcel shipping...",
  "cta_primary": "Get a free quote →",
  "cta_secondary": "How it works",
  "trust_1": "🇨🇦 All Canadian provinces",
  "trust_2": "📦 500+ families served",
  "trust_3": "⭐ 5-star service"
}
```

### FEATURES (array de cards)
```json
{
  "label": "Our Services",
  "title": "Why choose Box to Cuba?",
  "subtitle": "...",
  "cards": [
    { "icon": "📦", "title": "Door to Door", "desc": "We pick up..." },
    { "icon": "✈️", "title": "Weekly Flights", "desc": "Regular..." }
  ]
}
```

### HOW_IT_WORKS (array de pasos)
```json
{
  "label": "Process",
  "title": "How it works",
  "steps": [
    { "title": "Request a quote", "desc": "Fill out our form..." },
    { "title": "Pack your box", "desc": "We provide guidelines..." }
  ]
}
```

### FAQ (array de items)
```json
{
  "label": "FAQ",
  "title": "Frequently asked questions",
  "items": [
    { "q": "How long does shipping take?", "a": "Typically 7–14 days..." },
    { "q": "What items can I send?", "a": "Most personal items..." }
  ]
}
```

### CONTACT (objeto plano)
```json
{
  "label": "Contact us",
  "title": "We're here to help",
  "phone_label": "Phone",
  "phone_value": "+1 (416) 836-5517",
  "email_label": "Email",
  "email_value": "info@boxtocuba.ca",
  "location_label": "Locations",
  "location_value": "Toronto, Canada",
  "whatsapp_label": "WhatsApp",
  "whatsapp_value": "+14168365517"
}
```

### FOOTER (objeto plano)
```json
{
  "tagline": "Reliable parcel shipping from Canada to Cuba.",
  "quick_links": "Quick Links",
  "contact": "Contact",
  "rights": "© 2026 Box to Cuba. All rights reserved.",
  "phone": "+1 (416) 836-5517",
  "email": "info@boxtocuba.ca",
  "location_1": "Toronto, Ontario",
  "location_2": "Canada"
}
```

---

## LANDING_NOTICE — sistema de avisos

Controla los banners de aviso que aparecen en las páginas de provincias cuando hay interrupciones de servicio (vuelos cancelados, entregas limitadas, etc.).

```json
{
  "enabled": false,
  "capital_only": ["cienfuegos", "sancti-spiritus"],
  "pickup_havana": ["artemisa", "mayabeque", "pinar-del-rio", "isla-de-la-juventud"],
  "pickup_santiago": ["guantanamo"]
}
```

| Campo | Tipo de aviso | Color | Significado |
|-------|-------------|-------|-------------|
| `capital_only` | ⚠️ Capital only | Amber | Sin vuelos directos — entrega solo en la capital provincial |
| `pickup_havana` | 📍 Pickup en La Habana | Orange | Sin entrega — el paquete se retira en la oficina de La Habana |
| `pickup_santiago` | 🚫 Pickup en Santiago | Red | Sin servicio — el paquete se retira en Santiago de Cuba |

- Una provincia solo puede estar en un grupo a la vez (mutual exclusivity)
- `enabled: false` → ningún banner se muestra, la configuración se preserva
- Se gestiona desde el dashboard: `/admin` → Landing → 🚨 Notices

---

## Fallback JSON

Si Supabase no está disponible en build time (variables de entorno ausentes, error de red), `getCmsContent()` retorna el contenido de los archivos JSON en `src/i18n/`:

```
src/i18n/
├── en.json    # Fallback completo EN
├── es.json    # Fallback completo ES
└── fr.json    # Fallback completo FR
```

Estos archivos deben mantenerse actualizados y coherentes con lo que está en Supabase. Son la fuente de verdad cuando el CMS no está disponible y también sirven como documentación del schema de cada sección.

---

## Flujo de publish completo

```
1. Admin edita contenido en LandingAdmin.tsx
         │
         ▼
2. Click "Save" → PUT /admin-api/settings/:id (value actualizado)
                → LANDING_PENDING_CHANGES = 'true'
                → LANDING_PENDING_SECTIONS += { key, before, after }
         │
         ▼
3. Click "🚀 Publish Changes"
   → POST Vercel Deploy Webhook URL
   → LANDING_PENDING_CHANGES = 'false'
   → LANDING_PENDING_SECTIONS = []
         │
         ▼
4. Vercel inicia rebuild (~60 segundos)
         │
         ▼
5. Astro build: getCmsContent('en'), getCmsContent('es'), getCmsContent('fr')
   → Fetch de 24 claves LANDING_* desde Supabase
   → Merge sobre JSON fallback
   → Genera ~60 páginas estáticas
         │
         ▼
6. Deploy completo → boxtocuba.ca actualizado
```

---

## Cómo agregar una sección nueva al CMS

1. **Dashboard** (`LandingAdmin.tsx`): agregar el nombre a `SECTION_ORDER` y su label a `SECTION_LABELS`
2. **Landing** (`src/i18n/en.json`, `es.json`, `fr.json`): agregar la clave con valores por defecto
3. **Supabase**: insertar las 3 filas (`LANDING_EN_NUEVASECCION`, `LANDING_ES_...`, `LANDING_FR_...`) con el JSON inicial
4. **Página Astro**: consumir con `t(content, 'nueva_seccion.campo')`
