# boxtocuba-landing

Sitio web público de **Box to Cuba** — servicio de paquetería de Canadá a Cuba. Generado estáticamente con Astro, contenido gestionado desde el dashboard de administración vía Supabase.

## Dominios

| Entorno | URL | Rama |
|---------|-----|------|
| Producción | `https://boxtocuba.ca` | `master` |
| Staging / Preview | `https://new.boxtocuba.ca` | `master` (alias Vercel) |

Cualquier push a `master` dispara un deploy automático en Vercel. Las propuestas visuales (archivos `public/proposal-*.html`) se suben pero no afectan el sitio principal.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Astro | 6.x |
| UI components | React | 19.x |
| Estilos | Tailwind CSS | 4.x |
| CMS | Supabase JS (build time only) | 2.x |
| Sitemap | @astrojs/sitemap | 3.x |
| Deploy | Vercel (static) | — |

> Supabase **solo se consulta en build time** — el sitio en producción es HTML estático puro, sin llamadas al backend en runtime.

---

## Estructura de archivos

```
boxtocuba-landing/
├── public/
│   ├── robots.txt              # Sitemap directive + allow all
│   ├── hero-cargo.jpg          # Imagen hero (air cargo)
│   ├── logo.png                # Logo principal
│   └── og-image.jpg            # OG fallback image
├── src/
│   ├── data/
│   │   └── provinces.ts        # ⭐ Fuente de verdad de las 16 provincias cubanas
│   ├── i18n/
│   │   ├── en.json             # Traducciones EN (fallback del CMS)
│   │   ├── es.json             # Traducciones ES (fallback del CMS)
│   │   ├── fr.json             # Traducciones FR (fallback del CMS)
│   │   └── index.ts            # getLangFromUrl(), useTranslations()
│   ├── layouts/
│   │   └── BaseLayout.astro    # Layout base: head, nav, footer, hreflang
│   ├── lib/
│   │   ├── cms.ts              # getCmsContent(), getNotice(), getProvinceNoticeType(), t()
│   │   └── supabase.ts         # Cliente Supabase para build time
│   ├── pages/
│   │   ├── index.astro                          # Homepage EN
│   │   ├── canada-to-cuba-shipping-rates.astro  # Tarifas EN
│   │   ├── cuba-customs-guide.astro             # Guía aduana EN
│   │   ├── cuba-prohibited-items.astro          # Artículos prohibidos EN
│   │   ├── provinces/
│   │   │   └── [province].astro                 # 16 páginas de provincias EN
│   │   ├── es/
│   │   │   ├── index.astro
│   │   │   ├── precios-envio-canada-cuba.astro
│   │   │   ├── guia-aduana-cuba.astro
│   │   │   ├── articulos-prohibidos-cuba.astro
│   │   │   └── provincias/
│   │   │       └── [province].astro             # 16 páginas de provincias ES
│   │   └── fr/
│   │       ├── index.astro
│   │       ├── tarifs-envoi-canada-cuba.astro
│   │       ├── guide-douanes-cuba.astro
│   │       ├── articles-interdits-cuba.astro
│   │       └── provinces/
│   │           └── [province].astro             # 16 páginas de provincias FR
│   └── styles/
│       └── global.css
├── astro.config.mjs            # site: 'https://boxtocuba.ca', i18n, sitemap
└── package.json
```

---

## Mapa de rutas

El sitio genera **~60 páginas estáticas** en build time.

### Inglés (default, sin prefijo)

| Ruta | Página |
|------|--------|
| `/` | Homepage |
| `/canada-to-cuba-shipping-rates/` | Tarifas de envío |
| `/cuba-customs-guide/` | Guía de aduana cubana |
| `/cuba-prohibited-items/` | Artículos prohibidos |
| `/provinces/la-habana/` | Página de La Habana |
| `/provinces/[slug]/` | × 16 provincias cubanas |

### Español (`/es/`)

| Ruta | Página |
|------|--------|
| `/es/` | Homepage |
| `/es/precios-envio-canada-cuba/` | Tarifas de envío |
| `/es/guia-aduana-cuba/` | Guía de aduana cubana |
| `/es/articulos-prohibidos-cuba/` | Artículos prohibidos |
| `/es/provincias/[slug]/` | × 16 provincias cubanas |

### Francés (`/fr/`)

| Ruta | Página |
|------|--------|
| `/fr/` | Homepage |
| `/fr/tarifs-envoi-canada-cuba/` | Tarifas de envío |
| `/fr/guide-douanes-cuba/` | Guía de aduana cubana |
| `/fr/articles-interdits-cuba/` | Artículos prohibidos |
| `/fr/provinces/[slug]/` | × 16 provincias cubanas |

---

## Variables de entorno

Crear un archivo `.env` en la raíz (no se commitea):

```env
SUPABASE_URL=https://lnfsqlxfzkhvptnczprc.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
```

> Se usa la **service role key** (no la anon key) porque el CMS lee la tabla `settings` en build time desde el servidor, fuera del contexto de un usuario autenticado.
>
> Si estas variables no están presentes, `cms.ts` cae silenciosamente al fallback JSON en `src/i18n/`.

---

## Comandos

```bash
npm install          # Instala dependencias
npm run dev          # Dev server en http://localhost:4321 (hot reload)
npm run build        # Build estático → ./dist/ (consulta Supabase)
npm run preview      # Preview del build local
```

---

## Convenciones de desarrollo

### Modificar contenido del sitio
- **Vía CMS** (recomendado): editar desde `/admin` en el dashboard → tab Landing → Publish. Dispara rebuild automático.
- **Vía JSON** (fallback): editar `src/i18n/en.json`, `es.json`, `fr.json`. El CMS sobreescribe estos valores si tiene la clave en Supabase.

### Agregar una página nueva
1. Crear el archivo `.astro` en `src/pages/`
2. Si es contenido multiidioma, crear versiones en `src/pages/es/` y `src/pages/fr/`
3. Agregar `hreflang` alternates en `BaseLayout.astro` o pasarlos via prop `alternates`

### Agregar una provincia nueva
Solo editar `src/data/provinces.ts` — las 3 rutas dinámicas la incluirán automáticamente en el próximo build.

### Propuestas visuales
Guardar en `public/proposal-*.html`. Son accesibles en local (`localhost:4321/proposal-*.html`) pero **nunca se despliegan a producción** intencionalmente (Vercel sí las sirve si se hace push, evitar commitearlas).

---

## Documentación adicional

| Documento | Descripción |
|-----------|-------------|
| [`docs/cms.md`](docs/cms.md) | Sistema CMS: claves Supabase, fallback JSON, flujo de publish |
| [`docs/provinces.md`](docs/provinces.md) | Sistema de 48 páginas de provincias cubanas |
| [`docs/seo.md`](docs/seo.md) | Estrategia SEO por fases, sitemap, schema markup |
