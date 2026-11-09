# Landing-page photography

All four photographs are stored at reduced size (longest edge 1100–1500 px,
progressive JPEG, quality 82) so the landing page stays under ~500 KB of
images in total. Replace a file in place to swap a photo — the file names are
referenced from `src/web/pages/Landing.tsx`.

| File | In use | Photographer | Source |
| --- | --- | --- | --- |
| `hero-family.jpg` | Hero panel | Matilda Wormwood | [Pexels 7484416](https://www.pexels.com/photo/7484416/) |
| `teen-phone.jpg` | Risk-first alerts section | kaboompics | [Pexels 6255938](https://www.pexels.com/photo/6255938/) |
| `family-walk.jpg` | Safe zones section | TheVirtualDenise | [Pixabay 2485714](https://pixabay.com/images/id-2485714/) |
| `about-family.jpg` | About banner | George Pak | [Pexels 7984363](https://www.pexels.com/photo/7984363/) |

## Licences

- **Pexels** — free to use, no attribution required (the table above credits the
  photographers anyway). See <https://www.pexels.com/license/>.
- **Pixabay** — Pixabay Content Licence, free for commercial use, no attribution
  required. See <https://pixabay.com/service/license-summary/>.

Neither licence permits reselling the photos unaltered or implying that the
people pictured endorse KIDSbSAFE. The images are illustrative only.

## Replacing a photo

The API keys for both services live in the repository-root `.env`
(`PEXELS_API_KEY`, `PIXABAY_API_KEY`) and are never needed at runtime — the
site serves the committed files. To refresh a photo:

1. Search Pexels or Pixabay, download the largest version.
2. Resize so the longest edge is at most 1500 px and save as progressive JPEG.
3. Overwrite the file here and update this table.
