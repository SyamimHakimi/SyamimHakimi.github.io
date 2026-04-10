# public/

Static assets served at the site root. These files are copied to `dist/` at build time
and are accessible at `/filename` on the live site.

## Files

| File / Directory | Purpose |
|-----------------|---------|
| `favicon.svg` | Browser tab icon |
| `og-image.jpg` | Default Open Graph social preview image (1200×630). Used when no page-specific image is set. |
| `robots.txt` | Search engine crawling policy. Allows all bots; references the sitemap. |
| `media/` | Static media assets (photography gear images, logos, illustrations, icons). |
| `splash-screen.css` | Legacy splash screen styles (pre-migration artifact). |

## Notes

- `sitemap-index.xml` and `sitemap-0.xml` are generated at build time by `@astrojs/sitemap`
  and land in `dist/` — they are not stored here.
- All images in `media/` are served as-is; no image optimization pipeline is configured.
