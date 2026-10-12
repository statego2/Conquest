# CONQUEST

A territory-conquest strategy game prototype.

The first production layer is the **art-direction system and asset library**: a strategic map language built around provinces, armies, capitals, occupation, uprisings, and reconquest.

## Art package

- [Art direction and visual rules](docs/ART_DIRECTION.md)
- [Asset inventory and implementation guide](docs/ASSET_PIPELINE.md)
- [Visual asset gallery](art-preview.html)
- [Asset manifest](public/assets/conquest/manifest.json)

All first-pass art assets are **hand-authored, self-contained SVG** files: no external fonts, images, or dependencies. The asset preview runs in a browser without a build step.

> This is the **visual foundation**, not a claim that the gameplay is implemented. The demo map in the preview is fictional and intended to validate art readability and interaction states.
