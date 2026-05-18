/** Inline SVG placeholder when a gallery image URL fails to load. */
export const GALLERY_PLACEHOLDER_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#e2e8f0"/>
      <g fill="#94a3b8" transform="translate(160 95)">
        <rect x="20" y="50" width="60" height="45" rx="4" fill="#cbd5e1"/>
        <circle cx="35" cy="65" r="8" fill="#e2e8f0"/>
        <path d="M0 95 L25 70 L45 85 L80 55 L80 95 Z" fill="#cbd5e1"/>
      </g>
      <text x="200" y="175" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#64748b">Image unavailable</text>
    </svg>`
  );
