# CLAUDE.md — boxtocuba-landing

Instrucciones para Claude Code en este proyecto.

---

## Stack

Astro (SSG) + Tailwind CSS. Sitio multilingüe EN/ES/FR.

---

## Reglas de trabajo

### Confirmar antes de ejecutar cualquier tarea

Antes de tocar cualquier archivo o ejecutar cualquier comando, describir exactamente los cambios planeados (qué archivos se crean, modifican o borran) y terminar siempre con la pregunta explícita **"¿Procedo?"**. No ejecutar nada hasta recibir confirmación. Sin excepción, aunque parezca obvio.

### NUNCA commitear ni pushear sin orden explícita del usuario

**NUNCA** hacer `git commit` ni `git push` de forma autónoma. Sin excepción. Aunque `npm run verify` pase, aunque los cambios sean pequeños, aunque parezca obvio. Esperar siempre que el usuario diga explícitamente "commit", "pushea", "dale" o similar. El flujo es: hacer cambios → `npm run verify` → avisar "listo para probar en local" → esperar confirmación del usuario → esperar orden de commit.

### Páginas de test y proposal — nunca se indexan

Las páginas con prefijo `test-` o `proposal-` en `src/pages/` **nunca deben aparecer en el sitemap ni ser indexadas por Google**:
- `astro.config.mjs` ya las filtra del sitemap con `filter: (page) => !page.includes('/proposal-') && !page.includes('/test-')`
- Toda página `test-*` debe incluir `<meta name="robots" content="noindex, nofollow" />` en el `<head>`
- Borrar estas páginas cuando ya no sean necesarias — no dejarlas acumularse

### Actualizar docs al final de cada sesión

Antes de cerrar la sesión, revisar `git log` de ambos proyectos y actualizar los archivos afectados en `docs/` del dashboard (`docs/architecture.md`, `docs/landing-cms.md`). Proponer los cambios al usuario antes de escribirlos.

### Verify obligatorio antes de commitear

**Siempre** correr `npm run verify` (build + tests Playwright) y verificar que pasa sin errores antes de cualquier `git commit` o `git push`:

```bash
cd /Users/ernestoperezalonso/projects/boxtocuba-landing
npm run verify
```

El comando encadena `npm run build && npm test`. Debe terminar con el build completo y los ~62 tests Playwright en verde (2 skipped por diseño: desktop-only en mobile project y viceversa). Si falla, arreglar el error y volver a correr `npm run verify` antes de continuar.

**Por qué:**
- **Build:** caracteres especiales (apostrofes en francés, etc.) dentro de strings JS pueden romper el parser de esbuild sin que se note en el dev server.
- **Tests:** Playwright detecta regresiones de smoke/SEO/i18n/network — links rotos, meta tags duplicados, traducciones faltantes, assets 404 — que el build no atrapa.

Para un chequeo más profundo (reporte humano del estado del sitio, verificación explícita de sitemap/robots leaks), invocar el subagente `landing-tester`.

---

## Comandos frecuentes

```bash
# Servidor local
npm run dev -- --port 4321

# Verify (obligatorio antes de commit: build + tests Playwright)
npm run verify
```

---

## Estructura

```
src/
├── pages/          # EN (raíz), es/, fr/
├── components/
├── layouts/
├── data/           # cities.ts, provinces.ts
├── i18n/           # en.json, es.json, fr.json
└── lib/
public/
```

---

## Convenciones

- Páginas de **ciudades canadienses**: `ship-from-[city]-to-cuba.astro` — usuario envía DESDE esa ciudad A Cuba
- Páginas de **provincias cubanas**: `provinces/[province].astro` — usuario envía HACIA esa provincia
- Solo hay oficina en **Toronto (Scarborough)** — no mencionar Montreal como oficina
- Home pickup solo en GTA; otras ciudades envían a Toronto por Canada Post / Purolator
