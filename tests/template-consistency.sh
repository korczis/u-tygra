#!/bin/bash
# Template Consistency Regression Tests
# Validates navbar/footer/structure consistency across all built pages
# Run after: zola build
#
# Usage: bash tests/template-consistency.sh

set -uo pipefail

PASS=0
FAIL=0
PUBLIC="public"

pass() { ((PASS++)); echo "  [PASS] $1"; }
fail() { ((FAIL++)); echo "  [FAIL] $1"; }

check_file() {
  local file="$1"
  local pattern="$2"
  local desc="$3"
  if grep -q "$pattern" "$file" 2>/dev/null; then
    pass "$desc"
  else
    fail "$desc"
  fi
}

check_not_file() {
  local file="$1"
  local pattern="$2"
  local desc="$3"
  if grep -q "$pattern" "$file" 2>/dev/null; then
    fail "$desc"
  else
    pass "$desc"
  fi
}

count_pattern() {
  local file="$1"
  local pattern="$2"
  grep -o "$pattern" "$file" 2>/dev/null | wc -l | tr -d ' '
}

echo "════════════════════════════════════════"
echo "  Template Consistency Tests"
echo "════════════════════════════════════════"

if [ ! -d "$PUBLIC" ]; then
  echo "[ERROR] public/ directory not found. Run 'zola build' first."
  exit 1
fi

# ── Index page ──────────────────────────────────
echo ""
echo "Index page (/):"
INDEX="$PUBLIC/index.html"

nav_count=$(count_pattern "$INDEX" '<nav ')
[ "$nav_count" -eq 1 ] && pass "exactly 1 <nav> element" || fail "expected 1 <nav>, found $nav_count"

footer_count=$(count_pattern "$INDEX" '<footer')
[ "$footer_count" -eq 1 ] && pass "exactly 1 <footer> element" || fail "expected 1 <footer>, found $footer_count"

check_file "$INDEX" '#aktuality' "has #aktuality section link"
check_file "$INDEX" '#o-nas' "has #o-nas section link"
check_file "$INDEX" '#na-cepu' "has #na-cepu section link"
check_file "$INDEX" '#jidlo' "has #jidlo section link"
check_file "$INDEX" '#salonek' "has #salonek section link"
check_file "$INDEX" '#rezervace' "has #rezervace section link"
check_file "$INDEX" '#kontakt' "has #kontakt section link"
check_file "$INDEX" 'id=aktuality' "has aktuality section element"
check_file "$INDEX" 'id=o-nas' "has o-nas section element"
check_file "$INDEX" 'id=rezervace' "has rezervace section element"
check_file "$INDEX" 'FIREBASE_CONFIG' "has Firebase config"

# ── Glosar list page ────────────────────────────
echo ""
echo "Glosar list page (/glosar/):"
GLOSAR="$PUBLIC/glosar/index.html"

nav_count=$(count_pattern "$GLOSAR" '<nav ')
# 1 main nav from base.html (breadcrumb nav only on detail pages)
[ "$nav_count" -eq 1 ] && pass "exactly 1 <nav> element" || fail "expected 1 <nav>, found $nav_count"

footer_count=$(count_pattern "$GLOSAR" '<footer')
[ "$footer_count" -eq 1 ] && pass "exactly 1 <footer> element" || fail "expected 1 <footer>, found $footer_count"

check_file "$GLOSAR" '#aktuality' "navbar has #aktuality link"
check_file "$GLOSAR" '#rezervace' "navbar has #rezervace link"
check_file "$GLOSAR" 'Provozovatel' "footer has Provozovatel section"
check_not_file "$GLOSAR" 'app\.js' "does NOT load app.js"

# ── Glosar detail page ──────────────────────────
echo ""
echo "Glosar detail page (/glosar/*/): "
# Pick first glosar page
GLOSAR_DETAIL=$(find "$PUBLIC/glosar" -mindepth 2 -name "index.html" | head -1)
if [ -n "$GLOSAR_DETAIL" ]; then
  nav_count=$(count_pattern "$GLOSAR_DETAIL" '<nav ')
  # 1 main nav + 1 breadcrumb nav = 2
  [ "$nav_count" -eq 2 ] && pass "exactly 2 <nav> elements (main + breadcrumb)" || fail "expected 2 <nav>, found $nav_count"

  footer_count=$(count_pattern "$GLOSAR_DETAIL" '<footer')
  [ "$footer_count" -eq 1 ] && pass "exactly 1 <footer> element" || fail "expected 1 <footer>, found $footer_count"

  check_file "$GLOSAR_DETAIL" 'Breadcrumb' "has breadcrumb navigation"
  check_file "$GLOSAR_DETAIL" 'Provozovatel' "footer has Provozovatel section"
  check_not_file "$GLOSAR_DETAIL" 'app\.js' "does NOT load app.js"
else
  fail "no glosar detail page found"
fi

# ── Privacy page ────────────────────────────────
echo ""
echo "Privacy page (/ochrana-udaju/):"
PRIVACY="$PUBLIC/ochrana-udaju/index.html"

nav_count=$(count_pattern "$PRIVACY" '<nav ')
# 1 main nav + 1 breadcrumb = 2
[ "$nav_count" -eq 2 ] && pass "exactly 2 <nav> elements (main + breadcrumb)" || fail "expected 2 <nav>, found $nav_count"

footer_count=$(count_pattern "$PRIVACY" '<footer')
[ "$footer_count" -eq 1 ] && pass "exactly 1 <footer> (no double footer)" || fail "expected 1 <footer>, found $footer_count (DOUBLE FOOTER BUG)"

check_file "$PRIVACY" 'Provozovatel' "footer has Provozovatel section"
check_not_file "$PRIVACY" 'app\.js' "does NOT load app.js"

# ── Admin page ──────────────────────────────────
echo ""
echo "Admin page (/admin/):"
ADMIN="$PUBLIC/admin/index.html"

check_not_file "$ADMIN" 'Hlavní navigace' "does NOT have shared navbar"
check_not_file "$ADMIN" 'Provozovatel' "does NOT have shared footer"
check_file "$ADMIN" 'admin\.js' "loads admin.js"
check_not_file "$ADMIN" 'app\.js' "does NOT load app.js"
check_file "$ADMIN" 'FIREBASE_CONFIG' "has Firebase config"

# ── Link consistency ────────────────────────────
echo ""
echo "Link consistency:"
# Check all pages use | safe for base_url (no &amp; in URLs)
for page in "$INDEX" "$GLOSAR" "$PRIVACY" "$ADMIN"; do
  name=$(echo "$page" | sed "s|$PUBLIC/||")
  check_not_file "$page" '&amp;.*base_url\|base_url.*&amp;' "$name: no &amp; in base_url links"
done

# ── Footer nav links consistency ────────────────
echo ""
echo "Footer navigation links:"
for section in aktuality o-nas na-cepu jidlo salonek rezervace galerie kontakt; do
  check_file "$GLOSAR" "#${section}" "glosar footer has #${section}"
done

# ── Summary ─────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo "  Template Consistency Report"
echo "════════════════════════════════════════"
echo ""
echo "  Total: $((PASS + FAIL))"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "[FAIL] $FAIL test(s) failed."
  exit 1
else
  echo "[PASS] All $PASS tests passed."
  exit 0
fi
