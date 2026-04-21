# CLAUDE.md — boxtocuba-landing

Instrucciones para Claude Code en este proyecto.

---

## Stack

Astro (SSG) + Tailwind CSS. Sitio multilingüe EN/ES/FR.

---

## Reglas de trabajo

### Build obligatorio antes de commitear

**Siempre** correr el build y verificar que pasa sin errores antes de cualquier `git commit` o `git push`:

```bash
cd /Users/ernestoperezalonso/projects/boxtocuba-landing
npm run build
```

El build debe terminar con `Build complete` sin errores. Si falla, arreglar el error y volver a correr el build antes de continuar.

**Por qué:** Caracteres especiales (apostrofes en francés, etc.) dentro de strings JS pueden romper el parser de esbuild sin que se note en el dev server.

---

## Comandos frecuentes

```bash
# Servidor local
npm run dev -- --port 4321

# Build de verificación (obligatorio antes de commit)
npm run build
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
