# I²M GitHub Pages website

This folder is a complete static website for the Intelligent Immersion in the
Metaverse ACM Virtual Chapter. It uses only HTML, CSS, and JavaScript, so it can
be published directly with GitHub Pages.

## Structure

```text
i2m/
├── index.html    # Content and page structure
├── styles.css    # Visual design and responsive layout
├── script.js     # Particle field, animations, tabs, and mobile navigation
└── README.md     # These instructions
```

## Publish

1. Download or copy the three website files (`index.html`, `styles.css`, and
   `script.js`) into the root of the `Meg-R/i2m` repository.
2. Replace the existing temporary `index.html`.
3. Commit the files to the `main` branch.
4. Keep GitHub Pages configured for `main` and `/(root)`.
5. Wait for the Pages deployment to complete, then open:
   `https://meg-r.github.io/i2m/`

## Edit later

- Update page wording and links in `index.html`.
- Change colors in the `:root` section at the top of `styles.css`.
- Adjust particle quantity and behavior near the bottom of `script.js`.
- Replace the Discord invitation in `index.html` if the community link changes.

No build command or third-party JavaScript library is required.
