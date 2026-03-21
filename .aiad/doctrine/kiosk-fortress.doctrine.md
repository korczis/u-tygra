# KIOSK FORTRESS - Display Security & UX Doctrine

**Version**: 1.0.0
**Status**: ABSOLUTE ENFORCEMENT
**Authority**: SUPREME COMMAND
**Last Updated**: 2026-03-21
**Classification**: L3 (Publicly Shareable)
**Integration**: NMND + Golden Tap Doctrines

---

## Core Philosophy

**KIOSK FORTRESS**: The TV in the pub is a fortress — impenetrable to tampering, resilient to failures, optimized for one purpose: showing what's on tap. No interaction needed. No interaction possible.

---

## Philosophical Foundation

> *"Televize v hospode ma jeden ukol. Ukazat co je na cepu. Vsechno ostatni je utok na pozornost."*

### Why This Doctrine Exists

A kiosk display in a pub faces unique threats:
- Drunk patrons trying to interact with it
- Network outages during peak hours
- Screen burn-in from 16+ hour daily operation
- Ambient lighting changes (daylight to dim evening)
- Staff needing quick visual confirmation of beer changes

This doctrine ensures the display is:
- **Indestructible**: No interaction can break it
- **Self-healing**: Recovers from any failure automatically
- **Readable**: Legible from 5 meters in dim lighting
- **Focused**: Shows only what matters, nothing else

---

## The Doctrine

### 1. VISUAL READABILITY

```yaml
rule: readable_from_five_meters
enforcement: HARD
applies_to: [kiosk_mode]
requirements:
  minimum_font_size: 24px  # Nothing smaller
  beer_name: 48px           # Bold, primary info
  price: 64px               # Largest element, bright gold
  brewery: 32px             # Secondary info
  style_badge: 28px         # Color-coded
  announcement: 56px        # Must catch attention
  color_contrast: "7:1"     # WCAG AAA for dark backgrounds
  font_weight: "600+"       # Semi-bold minimum for primary
```

### 2. CONTENT HIERARCHY

```yaml
rule: show_only_what_matters
enforcement: HARD
visible_in_kiosk:
  - Beer name, brewery, style, ABV, price
  - Announcement banner
  - Current time
  - "Last updated" indicator
  - Rotating trivia/events
hidden_in_kiosk:
  - Navigation menu
  - Footer (legal, bank account, ICO)
  - Contact section
  - Google Maps
  - Food menu (separate display)
  - Cookie consent
  - PWA install prompt
  - Social media links
  - Any interactive element
```

### 3. INTERACTION LOCKDOWN

```yaml
rule: no_user_interaction_possible
enforcement: HARD
disabled:
  - Mouse cursor (hidden)
  - Right-click context menu
  - Keyboard shortcuts (except F5 for staff refresh)
  - Text selection
  - Drag and drop
  - Pinch zoom
  - Scroll (content fits viewport)
  - All links and buttons
css:
  user-select: none
  pointer-events: none
  cursor: none
  overflow: hidden
```

### 4. SELF-HEALING

```yaml
rule: automatic_recovery_from_any_failure
enforcement: HARD
mechanisms:
  data_refresh: "90 second interval with exponential backoff"
  full_reload: "Every 6 hours for memory hygiene"
  meta_refresh: "300 second dead-man switch"
  error_boundary: "Catch all JS errors, log, continue"
  memory_watchdog: "Reload if heap > 200MB"
  wake_lock: "Prevent display sleep"
  anti_burn_in: "2px pixel shift every 5 minutes"
```

### 5. DARK ENVIRONMENT OPTIMIZATION

```yaml
rule: optimized_for_pub_ambience
enforcement: HARD
palette:
  background: "#1a1206"       # Very dark warm brown
  card_bg: "#2a1f10"          # Slight elevation
  primary_text: "#f0e6d0"    # Warm off-white
  secondary_text: "#b8a882"  # Muted gold
  accent: "#f08c0f"          # Tiger orange
  price: "#ffc857"           # Bright gold
  new_badge: "#4ade80"       # Green
  last_keg: "#f87171"        # Red
screen_brightness: "70%"      # Reduce glare in dim lighting
```

### 6. LAYOUT ARCHITECTURE

```yaml
rule: fixed_viewport_no_scroll
enforcement: HARD
layout: "1920x1080 landscape"
zones:
  header: "120px - Logo + title + clock"
  content: "880px - Beer grid (4 columns x 2 rows max)"
  footer: "80px - Rotating announcements/trivia"
safe_margins: "40px all edges (TV overscan)"
beer_cap: "8 per page, paginate if more"
rotation:
  beer_page: "10 seconds"
  announcement: "6 seconds"
  trivia: "6 seconds"
```

---

## Enforcement

### CSS Validation
- No element in kiosk mode smaller than 24px font
- All kiosk elements must use the dark palette
- No hover states or cursor-dependent styles

### Runtime Validation
- Wake Lock must be active
- Data refresh interval must be running
- Anti-burn-in shift must be active
- Memory usage must be below threshold

### Chromium Launch Flags
```bash
chromium --kiosk --noerrdialogs --disable-translate --disable-infobars \
  --disable-suggestions-service --disable-save-password-bubble \
  --disable-session-crashed-bubble --start-fullscreen \
  --window-size=1920,1080 \
  "https://[url]/?kiosk=1"
```

---

## Mantras

- "The TV shows beer. Period."
- "If a drunk can break it, you haven't fortified enough"
- "No blank screens. Ever."
- "Readable from the bar, readable from the door"
