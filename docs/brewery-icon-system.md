# Brewery Icon System

## Overview
Instead of downloading 1000+ brewery images (which would have legal and performance issues), the Pivnice U Tygra site uses a custom SVG icon system to visually represent different types of breweries.

## Icon Types

### Czech Traditional (`czech-traditional`)
- **Color**: Yellow (`text-yellow-400`)
- **Used for**: Major Czech traditional breweries
- **Examples**: Budvar, Pilsner Urquell, Staropramen, Kozel, Krušovice, Gambrinus, Primátor

### Craft/Artisanal (`craft-brewery`)
- **Color**: Orange (`text-orange-400`)
- **Used for**: Small craft and artisanal breweries
- **Examples**: Bernard, Matuška, Clock, Raven, Falkon, Chotěbor, Mazák, Dva kohouti

### Moravian (`moravian`)
- **Color**: Purple (`text-purple-400`)
- **Used for**: Breweries from Moravian region
- **Examples**: Tišnov, Rychtář

### International (`international`)
- **Color**: Blue (`text-blue-400`)
- **Used for**: International and foreign breweries
- **Examples**: Guinness, Hoegaarden, Sierra Nevada, Maisel's

### Historical (`historical`)
- **Color**: Green (`text-green-400`)
- **Used for**: Historic breweries with long tradition
- **Examples**: U Fleků

## Implementation

### JavaScript Function
```javascript
breweryIcon(name) {
  if (!name) return 'czech-traditional'; // default
  const n = name.toLowerCase().trim();

  // exact match
  if (this.breweryIcons[n]) return this.breweryIcons[n];

  // partial match
  for (const [key, icon] of Object.entries(this.breweryIcons)) {
    if (n.includes(key) || key.includes(n)) return icon;
  }

  // fallback based on name patterns
  if (n.includes('pivovar') || n.includes('brewery')) return 'craft-brewery';
  if (n.includes('micro')) return 'micro';

  return 'czech-traditional'; // default
}
```

### HTML Usage
```html
<svg class="w-4 h-4 opacity-70" :class="`text-${breweryIcon(beer['pivovar']) === 'czech-traditional' ? 'yellow' : breweryIcon(beer['pivovar']) === 'craft-brewery' ? 'orange' : breweryIcon(beer['pivovar']) === 'international' ? 'blue' : breweryIcon(beer['pivovar']) === 'moravian' ? 'purple' : 'green'}-400`">
  <use :href="`/img/brewery-icons.svg#icon-${breweryIcon(beer['pivovar'])}`"></use>
</svg>
```

### Legend Display
The site includes a legend showing all icon types with their meanings in Czech:
- Tradiční český (Yellow)
- Řemeslný (Orange)
- Moravský (Purple)
- Mezinárodní (Blue)
- Historický (Green)

## Benefits

1. **Legal Compliance**: No copyright issues with brewery logos
2. **Performance**: Single 4.6KB SVG file vs hundreds of images
3. **Consistency**: Uniform visual design across all breweries
4. **Scalability**: Easy to add new brewery types and mappings
5. **Accessibility**: Proper color contrast and semantic meaning

## Future Enhancements

- Add icons for specific beer styles
- Regional sub-categories (Bohemia vs. Moravia vs. Silesia)
- Microbrewery vs. large brewery distinction
- Family/independent brewery indicators

## Technical Details

- **File**: `/static/img/brewery-icons.svg` (4.6KB)
- **Format**: SVG symbols for optimal performance
- **Integration**: Alpine.js reactive system with Tailwind CSS colors
- **Fallback**: Defaults to Czech traditional icon for unknown breweries