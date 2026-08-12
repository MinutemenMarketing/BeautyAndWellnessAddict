# Beauty &amp; Wellness addict NY — website

Static multi-page site. No build step, no dependencies. Open `index.html` or serve the folder.

```bash
npx serve beauty-wellness-addict -l 4321
```

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home |
| `about.html` | The practice, founder bios, brand note |
| `services.html` | Full treatment directory (expandable detail) |
| `longevity.html` | Longevity &amp; wellness |
| `aesthetics.html` | Aesthetics &amp; skin |
| `drip-addict.html` | IV therapy sub-brand |
| `pricing.html` | Full pricing with packages |
| `contact.html` | Contact details + enquiry form |
| `404.html` | Not-found page |

Shared assets: `assets/css/site.css`, `assets/js/site.js`, `assets/img/`.

## Design system

- **Display type:** Bodoni Moda, 400 and italic only. It matches the client's own logo, which is set in a high-contrast Didone serif.
- **Text type:** Instrument Sans, 400 and 500 only. Four faces load in total.
- **Palette:** ivory `#F7F3EC`, shell `#EFE6DB`, sand `#E4D8C9`, nude `#D6C3B2`, taupe `#B4A395`, greige `#6F6459`, mocha `#6B5749`, espresso `#2B2320`
- **Spacing:** four steps, `--sp-1` through `--sp-4`, plus `--sec` and `--sec-tight` for section rhythm. Nothing uses a one-off value.
- Every colour and size is a custom property at the top of `site.css`. Change it there and the whole site follows.
- `taupe` is for rules and for text on espresso only. On ivory it fails contrast; use `greige`.
- `drip addict` is the inverted (espresso) treatment rather than a second palette.

Motion is `[data-reveal]` plus one IntersectionObserver: a fade and rise for text, a clip-path wipe for images. `prefers-reduced-motion` disables all of it.

## What is deliberately missing

Nothing is invented: no names, credentials, hours, reviews or medical claims. Rather than show bracketed placeholders to visitors, the elements that need client information are held out of the page and marked with an HTML comment where they belong.

| What's needed | Where the comment sits |
| --- | --- |
| Founder names, titles, licensure, headshots, bios | `about.html`, above "Most people are given a treatment" |
| Email, address, opening hours, booking URL | `contact.html` contact rows, and `index.html` footer |
| Privacy policy, terms, accessibility statement | footer of every page |
| Real approved reviews | `index.html`, before the closing section |
| Cancellation and deposit policy | `pricing.html`, "Before you book" |

Each comment describes the markup to reuse, so adding the real content is a paste rather than a rebuild.

## The enquiry form

`contact.html` posts to FormSubmit, currently to `nmmedina08@icloud.com` (same setup as the Ray Nail Spa and Muses Nails sites).

**FormSubmit activates per domain as well as per address.** The first submission from a new domain triggers a one-time activation email that has to be clicked before anything is delivered.

- [ ] Send one test enquiry from the live site
- [ ] Open the FormSubmit email and click **Activate Form**
- [ ] Send a second test to confirm it arrives
- [ ] Expect this again on a custom domain, and again when the address changes at handover

On failure the form logs FormSubmit's own message to the console, which separates a pending activation from a real outage. Visitors see a fallback pointing them to the phone number.

## Before launch

1. Replace `beautyandwellnessaddictny.com` in the canonical/OG tags, `sitemap.xml` and `robots.txt` with the real domain.
2. Fill in the JSON-LD address in `index.html` once the business address is confirmed.
3. Re-check the pricing page against the client's current price list.
4. Serve images with long cache headers **only** if filenames are content-hashed; otherwise keep `max-age` short so price and photo updates appear immediately.

## Images

Photography in `assets/img/` was generated to a single art direction for launch. Replace with the practice's own photography as it becomes available — keep the same filenames and the layouts will not move.

`logo.png` is the client's supplied master logo. `mark.png` (BW monogram) and `logo-lockup.jpg` are crops of it. `founders.jpg` is the client's photograph, re-cropped in CSS so both founders sit centred on desktop and mobile.

`tools/optimize.ps1` resizes and re-encodes a source image to web-ready JPEG:

```bash
powershell -File tools/optimize.ps1 -Source in.png -Dest assets/img/out.jpg -MaxWidth 1400 -Quality 82
```

## Accessibility

Verified: single `h1` per page, sequential headings, alt text on every image, visible focus rings, keyboard-operable menu with focus trap and Escape, all interactive targets ≥44px, and every text/background pair meeting WCAG AA (4.5:1 body, 3:1 large display).

The services disclosure panels are marked `aria-expanded="true"` in the HTML and closed by JS on load, so the detail is readable if scripts fail.
