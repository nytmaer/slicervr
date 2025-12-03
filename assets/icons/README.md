# Icons Needed

## Required Sizes:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

## Design:
- **BOP ClipCut logo**
- Purple/Cyan cyberpunk theme
- Video camera or scissors icon
- Transparent background (PNG)

## Quick Creation Tools:
- **Canva**: canva.com (free templates)
- **Figma**: figma.com (design from scratch)
- **favicon.io**: favicon.io/favicon-generator/ (text to icon)

## Temporary Solution:
Use the SVG placeholder below, convert to PNG at both sizes.

```svg
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#b026ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00ffff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="#0a0014"/>
  <circle cx="256" cy="256" r="200" fill="url(#grad)" opacity="0.3"/>
  <text x="256" y="280" font-size="200" text-anchor="middle" fill="url(#grad)">🎬</text>
</svg>
```

Save as `icon.svg`, then convert using:
- **CloudConvert**: cloudconvert.com/svg-to-png
- **GIMP**: Free image editor
- **Online tools**: Any SVG to PNG converter
