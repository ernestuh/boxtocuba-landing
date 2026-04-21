#!/usr/bin/env bash
# smoke-test.sh — verifies all landing pages are live and contain expected content
set -uo pipefail

BASE="https://boxtocuba.ca"
PASS=0
FAIL=0
ERRORS=()

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ── helpers ──────────────────────────────────────────────────────────────────

check_status() {
  local label="$1" url="$2" expected="${3:-200}"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  if [[ "$status" == "$expected" ]]; then
    echo -e "  ${GREEN}✓${NC} $label ($status)"
    ((PASS++))
  else
    echo -e "  ${RED}✗${NC} $label — got $status, expected $expected"
    ERRORS+=("$label: HTTP $status (expected $expected) — $url")
    ((FAIL++))
  fi
}

check_content() {
  local label="$1" url="$2" needle="$3"
  local body
  body=$(curl -s --max-time 10 "$url")
  if echo "$body" | grep -qF "$needle"; then
    echo -e "  ${GREEN}✓${NC} $label"
    ((PASS++))
  else
    echo -e "  ${RED}✗${NC} $label — string not found: \"$needle\""
    ERRORS+=("$label: missing \"$needle\" — $url")
    ((FAIL++))
  fi
}

check_no_content() {
  local label="$1" url="$2" needle="$3"
  local body
  body=$(curl -s --max-time 10 "$url")
  if echo "$body" | grep -qF "$needle"; then
    echo -e "  ${RED}✗${NC} $label — found forbidden string: \"$needle\""
    ERRORS+=("$label: found \"$needle\" (should not exist) — $url")
    ((FAIL++))
  else
    echo -e "  ${GREEN}✓${NC} $label"
    ((PASS++))
  fi
}

section() { echo -e "\n${YELLOW}━━ $1 ━━${NC}"; }

# ── cities & provinces ───────────────────────────────────────────────────────

CITIES=(toronto calgary mississauga brampton markham vaughan ottawa hamilton london windsor montreal laval quebec-city vancouver surrey burnaby edmonton winnipeg halifax)

PROVINCES=(la-habana artemisa mayabeque pinar-del-rio isla-de-la-juventud matanzas villa-clara cienfuegos sancti-spiritus ciego-de-avila camaguey las-tunas holguin granma santiago-de-cuba guantanamo)

# ── 1. Hub pages ─────────────────────────────────────────────────────────────
section "Hub pages (EN / ES / FR)"
check_status "EN hub" "$BASE/ship-from-canada-to-cuba/"
check_status "ES hub" "$BASE/es/enviar-desde-canada-a-cuba/"
check_status "FR hub" "$BASE/fr/envoyer-du-canada-a-cuba/"

# ── 2. All city pages — status 200 ───────────────────────────────────────────
section "City pages — HTTP 200"
for city in "${CITIES[@]}"; do
  check_status "EN $city" "$BASE/ship-from-$city-to-cuba/"
  check_status "ES $city" "$BASE/es/enviar-desde-$city-a-cuba/"
  check_status "FR $city" "$BASE/fr/envoyer-de-$city-a-cuba/"
done

# ── 3. All province pages — status 200 ───────────────────────────────────────
section "Province pages — HTTP 200"
for prov in "${PROVINCES[@]}"; do
  check_status "EN $prov" "$BASE/provinces/$prov/"
  check_status "ES $prov" "$BASE/es/provincias/$prov/"
  check_status "FR $prov" "$BASE/fr/provinces/$prov/"
done

# ── 4. Internal links: city pages have province grid ─────────────────────────
section "City pages → province grid (content check)"
check_content "EN toronto has province grid" \
  "$BASE/ship-from-toronto-to-cuba/" "Delivery destinations"
check_content "ES montreal has province grid" \
  "$BASE/es/enviar-desde-montreal-a-cuba/" "Destinos de entrega"
check_content "FR vancouver has province grid" \
  "$BASE/fr/envoyer-de-vancouver-a-cuba/" "Destinations de livraison"

# City page links to a province
check_content "EN toronto links to la-habana" \
  "$BASE/ship-from-toronto-to-cuba/" "/provinces/la-habana/"
check_content "ES montreal links to santiago-de-cuba" \
  "$BASE/es/enviar-desde-montreal-a-cuba/" "/es/provincias/santiago-de-cuba/"
check_content "FR vancouver links to camaguey" \
  "$BASE/fr/envoyer-de-vancouver-a-cuba/" "/fr/provinces/camaguey/"

# ── 5. Internal links: province pages have cities pills ──────────────────────
section "Province pages → Canadian cities (content check)"
check_content "EN la-habana has cities section" \
  "$BASE/provinces/la-habana/" "Send to"
check_content "EN la-habana links to toronto" \
  "$BASE/provinces/la-habana/" "/ship-from-toronto-to-cuba/"
check_content "ES la-habana links to montreal" \
  "$BASE/es/provincias/la-habana/" "/es/enviar-desde-montreal-a-cuba/"
check_content "FR la-habana links to vancouver" \
  "$BASE/fr/provinces/la-habana/" "/fr/envoyer-de-vancouver-a-cuba/"

# ── 6. Homepage cities strip ──────────────────────────────────────────────────
section "Homepage cities strip"
check_content "EN homepage has cities strip" \
  "$BASE/" "Ship from your city"
check_content "EN homepage links to toronto city page" \
  "$BASE/" "/ship-from-toronto-to-cuba/"
check_content "EN homepage links to hub" \
  "$BASE/" "/ship-from-canada-to-cuba/"
check_content "ES homepage has cities strip" \
  "$BASE/es/" "desde tu ciudad"
check_content "FR homepage has cities strip" \
  "$BASE/fr/" "votre ville"

# ── 7. Navbar — Cities link present ──────────────────────────────────────────
section "Navbar — Cities link"
check_content "EN navbar has Cities link" \
  "$BASE/" "ship-from-canada-to-cuba"
check_content "ES navbar has Ciudades link" \
  "$BASE/es/" "enviar-desde-canada-a-cuba"
check_content "FR navbar has Villes link" \
  "$BASE/fr/" "envoyer-du-canada-a-cuba"

# ── 8. Sitemap — no proposals ────────────────────────────────────────────────
section "Sitemap — proposals excluded"
# Fetch the sitemap index first, then check each sitemap file
SITEMAP_INDEX=$(curl -s --max-time 10 "$BASE/sitemap-index.xml")
if echo "$SITEMAP_INDEX" | grep -qF "sitemap-0.xml"; then
  SITEMAP_URL=$(echo "$SITEMAP_INDEX" | grep -oP 'https://[^<]+sitemap-0\.xml' | head -1)
  check_no_content "sitemap-0.xml has no /proposal- pages" \
    "$SITEMAP_URL" "/proposal-"
else
  check_no_content "sitemap-index.xml has no /proposal- pages" \
    "$BASE/sitemap-index.xml" "/proposal-"
fi

# ── 9. Hreflang alternates on city pages ─────────────────────────────────────
section "Hreflang alternates"
check_content "EN toronto has ES alternate" \
  "$BASE/ship-from-toronto-to-cuba/" "hreflang=\"es\""
check_content "EN toronto has FR alternate" \
  "$BASE/ship-from-toronto-to-cuba/" "hreflang=\"fr\""
check_content "EN toronto has x-default alternate" \
  "$BASE/ship-from-toronto-to-cuba/" "hreflang=\"x-default\""

# ── 10. JSON-LD schema present ────────────────────────────────────────────────
section "JSON-LD schema"
check_content "EN toronto has Service schema" \
  "$BASE/ship-from-toronto-to-cuba/" "application/ld+json"
check_content "ES montreal has Service schema" \
  "$BASE/es/enviar-desde-montreal-a-cuba/" "application/ld+json"

# ── Summary ───────────────────────────────────────────────────────────────────
TOTAL=$((PASS + FAIL))
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Results: ${GREEN}$PASS passed${NC} / ${RED}$FAIL failed${NC} / $TOTAL total"

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  echo -e "\n${RED}Failures:${NC}"
  for err in "${ERRORS[@]}"; do
    echo "  • $err"
  done
  exit 1
else
  echo -e "${GREEN}All checks passed!${NC}"
fi
