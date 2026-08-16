# Beauty &amp; Wellness addict NY — website

Static multi-page site. No build step, no dependencies. Open `index.html` or serve the folder.

```bash
npx serve beauty-wellness-addict -l 4321
```

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home |
| `about.html` | The founders, the practice, real Google reviews |
| `services.html` | Every treatment, grouped, with pricing. The information hub. |
| `contact.html` | Booking, contact methods, inquiry form, map |
| `404.html` | Not-found page |

Shared assets: `assets/css/site.css`, `assets/js/site.js`, `assets/img/`.

Header, mobile menu and footer are duplicated in each HTML file — a change to one must be applied to all five.

### Consolidated routes

`longevity.html`, `pricing.html`, `drip-addict.html` and `aesthetics.html` were folded into
`services.html`. `vercel.json` 301-redirects each old path (with and without the `.html`
suffix) to the matching section anchor, so existing links and any indexed URLs keep working.

## Design system

- **Display type:** Cormorant Garamond, 400/500/600 plus italic. Weight 500-600 carries anything set in the serif below ~28px, where Cormorant otherwise runs thin.
- **Text type:** Manrope, 400 and 500.
- **Grounds:** ivory (page), cream (a step down), shell (a step further), espresso (dark moments). Sections change ground where a new idea starts, never on a fixed alternation. Two sections sharing a ground get 55% of the usual top padding, because they read as one continuous idea.
- **Gold:** `--gold #B08D57` for rules, icons, borders and text on espresso; `--gold-ink #7D5F2C` for text on ivory, cream and shell, where it clears 4.5:1 on all three. `--gold-hair` is the 55% rule tint used to open treatment lists.
- **Palette:** ivory `#F7F3EC` page, shell `#EFE6DB` secondary surface, sand `#E4D8C9` body text on espresso, taupe `#B4A395` rules and muted text on espresso, greige `#6F6459` muted text on ivory, mocha `#6B5749` accent and body text, espresso `#2B2320` ink.
- **Spacing:** four steps, `--sp-1` through `--sp-4`, plus `--sec` and `--sec-tight` for section rhythm.
- Every colour and size is a custom property at the top of `site.css`.
- `taupe` is for rules and for text on espresso only. On ivory it fails contrast; use `greige`.

### The three motifs

The art direction rests on three repeating elements and deliberately no more, because
consistency is what makes them read as identity rather than decoration.

| | Motif | Class | Behaviour |
| --- | --- | --- | --- |
| 01 | The champagne rule | `.rule-g` | A gold hairline that opens a section and draws itself left to right on reveal. |
| 02 | The signed script | `.script` | The same Sacramento hand as `addict` in the wordmark, for the two or three moments a page wants a human voice. Never body copy. |
| 03 | The editorial mask | `[data-reveal="mask"]` | The frame wipes open from the bottom while the photograph inside settles back from a 1.07 overscale. |

`[data-stagger]` sequences the direct children of a revealed block at 80ms intervals so a
heading, its copy and its link arrive in order rather than together.

**Do not add a fourth motif.** More elements make the system weaker, not richer.

### Hero

`.hero-full` is a full-bleed photograph at `100svh` with a two-axis scrim: a vertical
gradient carrying the bottom to 90% espresso and a horizontal one darkening the left, where
the type sits. The photograph's bright window is framed to the right (`object-position: 62%`),
so the brightest part of the image is never behind text. Ivory on the darkest sampled region
clears AA comfortably.

A `ch`-based `max-width` must never be used on the hero copy block: `ch` resolves against the
body font, not the display face the `h1` actually uses, and the headline wraps on itself.

## Motion

Motion is `[data-reveal]` plus one IntersectionObserver: fade, rise, and the mask and stagger
variants above. It is an enhancement and is never load-bearing.

The gate is `html.reveal-on`. An inline head script adds it and arms a 3s failsafe that
removes it; site.js disarms that timer only once an observer is confirmed running. So if
site.js is blocked, 404s, or throws, the timer fires and everything becomes visible. Further
nets: a sweep on load and on pageshow, a 2.5s check for anything still hidden above the fold,
a try/catch that drops the gate on any error, an error listener for a failed script tag, and
an onerror per image so a broken file never leaves a blank frame. Reduced motion and a missing
IntersectionObserver both reveal immediately.

Animated with opacity and transform only. An earlier version transitioned clip-path, which is
the most repaint-fragile property available here. The mask motif is a `::after` panel scaled
on the Y axis for the same reason — it is not a clip-path.

Under `prefers-reduced-motion` the mask panels are removed outright, the rules are held at
`scaleX(1)`, and staggered children are forced visible. Reduced motion means no animation,
never no image.

The mask panel takes its colour from the ground it sits on (`--cream` inside `.bg-cream`,
`--shell` inside `.bg-shell` and `.abouthero`, `--espresso` inside `.inv`). Get this wrong and
the wipe shows an ivory rectangle sliding off a cream section.

## Page structure

**About** runs white hero → Gallery (`#F2EBE1`) → Reviews (espresso) → closing band. The hero
is typography-led with no photograph on purpose: the white ground is what makes the cream
Gallery read as a deliberate divider rather than one more beige band.

The founders' mission copy now lives only on the homepage, in Meet the Founders. It was removed
from About along with the section that carried it. Put it back on About if the page ever needs
prose again.

**Contact** is two matched columns on desktop. Both start on the same grid line, so the top of
the form meets the top of the booking button. The map is the flexible element in the left
column — it takes whatever height is left over, which brings the bottom of the ladder level
with the bottom of the form. The textarea absorbs slack on the form side. Measured at 1280px:
both alignments land at 0px, and the map is exactly the column width.

`.map` carries its own aspect-ratio, which fights that fill, so `.map.contact__map` drops it
above 940px and restores 4:3 below, where the columns stack in ladder order.

## Vitamin accordion

Fourteen compounds under Drip addict, each a real `<button>` inside an `<h4>`, with
`aria-expanded`, `aria-controls` and a panel marked `role="region"` and labelled back to its
button. One opens at a time.

The panels are **open in CSS by default**. `site.js` adds `.js-ready` to the container once it
has wired the buttons up, and only then are panels allowed to close — so if the script never
runs, all fourteen descriptions are simply readable rather than sealed shut.

Copy is deliberately hedged: "is involved in", "plays a role in", "commonly associated with".
Nothing there says a compound treats, cures or prevents anything, and it should stay that way.

## Gallery lightbox

`about.html` carries a click-to-enlarge gallery. `site.js` builds one dialog on first open and
reuses it. Escape closes, arrow keys move, focus is trapped inside the dialog and returned to
the button that opened it, the backdrop closes on click, and the body scroll locks while it is
open.

It is progressive enhancement: with no JS the buttons do nothing and the gallery is still a
grid of visible photographs.

The entrance opacity is applied by `requestAnimationFrame` **and** an 80ms timer, whichever
fires first. A backgrounded or non-compositing tab never runs rAF, and without the timer the
dialog could sit at opacity 0 with the page scroll already locked — the same class of bug as
an image that never reveals.

## SEO

Each page carries its own title, description, canonical, Open Graph set and JSON-LD. Titles
lead with the practice name or the page's subject and name Great Neck; descriptions name the
real treatments rather than adjectives.

Structured data uses one shared `@id` (`…/#practice`) across pages so the crawler resolves a
single business entity: `MedicalBusiness` with address, phone, `areaServed`, `availableService`,
`employee` (both founders, with their real credentials), `sameAs`, `hasMap` and a `ReserveAction`
pointing at Square. `services.html` adds an `OfferCatalog` of twelve treatments with their real
prices, and About, Services and Contact each carry a `BreadcrumbList`.

There is no `AggregateRating` markup. The 5.0/38 figure is real but was removed from the visible
page in this pass, and rating schema without corresponding on-page content is exactly the kind of
claim that gets a listing penalised. Do not add it back without the visible content to match.

## Pricing and services

`services.html` is the single source of pricing on the site. Every price was read from the
practice's live Square booking catalogue, which is the source of truth for anything bookable.
Where a Square record carries a customer-facing price description, that text wins over the raw
item price.

Three items could not be reconciled and are marked `UNRESOLVED` in a comment beside the row
rather than guessed:

| Item | Conflict | Shown as |
| --- | --- | --- |
| Microneedling with Z.O. | Square's price description says $360, the item price on the same record says $460 | $360 |
| Botox for excess sweating | Square lists $8, against $12 per unit for every other neurotoxin service | "Price at consult" |
| LED light therapy, OMNILUX LED mask | Carried over from the previous price list; neither appears in the current Square catalogue | Kept at $40/$100 and $325 |

IV therapy exists in Square as a single bookable service, "IV Drip, starting at $249", with no
published per-formula menu. Individual drip names are deliberately not listed rather than
invented.

## What is deliberately missing

Nothing is invented: no credentials, hours, reviews or medical claims beyond what is
published. Elements that need client information are held out of the page and marked with an
HTML comment where they belong.

| What's needed | Where the comment sits |
| --- | --- |
| Opening hours | `contact.html` methods block. Held back because the Square profile and the Google listing currently disagree. |
| Public email address | `contact.html` methods block |
| Privacy policy, terms, accessibility statement | footer of every page |

## Reviews

The five reviews on `about.html` are real, published Google reviews, quoted as written and
trimmed only for length. They are attributed by the reviewer's name as it appears publicly and
labelled "Google review". The rating shown, 5.0 from 38 reviews, is the published aggregate.
Do not paraphrase these, and do not add a review that has not been verified as published.

## Booking

Every booking CTA opens the practice Square booking page in a new tab. There are 20 across the
site: header, mobile menu and footer on each page, plus the hero, the Services closing band and
the Contact page primary button.

```
https://book.squareup.com/appointments/sxo39ov27u4avm/location/LW02SPDAKGV63/services
```

To change it, replace that string everywhere; it is a plain href, no script. Square is not
embedded, so nothing here breaks if Square changes its UI.

## Social

- Instagram: `https://www.instagram.com/BeautyAddict_NY/`
- Facebook: `https://www.facebook.com/beautyaddictnewyork/` — verified as the practice's own
  page by the matching address (200 Middle Neck Road) and its posts referencing Beauty and
  Wellness Addict. Note that Square's own profile record lists no Facebook URL, so this was
  confirmed independently rather than taken from Square.

## The inquiry form

`contact.html` posts to FormSubmit, currently to `nmmedina08@icloud.com`.

**FormSubmit activates per domain as well as per address.** The first submission from a new
domain triggers a one-time activation email that has to be clicked before anything is delivered.

- [ ] Send one test inquiry from the live site
- [ ] Open the FormSubmit email and click **Activate Form**
- [ ] Send a second test to confirm it arrives
- [ ] Expect this again on a custom domain, and again when the address changes at handover

On failure the form logs FormSubmit's own message to the console, which separates a pending
activation from a real outage. Visitors see a fallback pointing them to the phone number.

## Before launch

1. Replace `beautyandwellnessaddictny.com` in the canonical/OG tags, `sitemap.xml` and `robots.txt` with the real domain.
2. Confirm the three UNRESOLVED prices above, and whether the two LED treatments are still offered.
3. Confirm opening hours and a public email address, then add both to `contact.html`.
4. Serve images with long cache headers **only** if filenames are content-hashed; otherwise keep `max-age` short so price and photo updates appear immediately.

## Images

Every photograph appears exactly once across the whole site: 14 placements, 14 distinct
images. `founders.jpg` is the client's own photograph of Sheila Omrani and Lisa Farazmand and
anchors the Meet the Founders section on the homepage; it loads eagerly rather than lazily
because it is the brand's key image and sits in the second section.

Five files are deliberately unreferenced: `serums.jpg`, `curtain-light.jpg`, `olive-shadow.jpg`,
`hands-lap.jpg` and `skin-macro.jpg`. They are the most generic images in the set, and the
Gallery was rebuilt around real photographs of the practice instead. They are kept rather than
deleted in case a future section needs them.

### The client photographs

Four photographs are the client's own, converted from supplied PNGs whose originals live in
`_source/` (gitignored, never served):

| File | Where | Native size |
| --- | --- | --- |
| `founders.jpg` | Homepage, Meet the Founders | 1083×1453 |
| `founders-flowerwall.jpg` | Gallery — at the Beauty Addict flower wall | 348×348 |
| `flowerwall-signage.jpg` | Gallery — the flower wall and neon sign | 382×510 |
| `founders-office.jpg` | Gallery | 352×236 |
| `founders-artwork.jpg` | Gallery | 511×510 |

**All but the first are small — 348px to 511px wide.** The Gallery's column count is chosen so
a column never exceeds the smallest of them by more than a few percent: two columns from 700px,
three from 900px, four from 1200px. That is the reason for those breakpoints; widen them and
the client photographs go soft. Multi-column also means each keeps its own aspect ratio and
nothing is cropped to fit a cell.

`founders-office.jpg` arrived letterboxed with pure-black bars down both sides. It was cropped
to columns 80–431 of the original 512px frame; the stored file is the photograph only. If it is
ever re-exported from the original, check the edges again before dropping it in.

### One image still to source

The photograph library holds nothing that shows scalp or hair. **The Hair & Scalp category
therefore has no banner image** — the section runs on typography, the way Consultations does.
Substituting an unrelated still life there would be worse than the gap. There is an HTML
comment marking exactly where a real photograph should go.

`logo.png` is the client's supplied master logo. `mark.png` (BW monogram) and `logo-lockup.jpg`
are crops of it. `logo.png` and `logo-lockup.jpg` are currently unreferenced.

`tools/optimize.ps1` resizes and re-encodes a source image to web-ready JPEG:

```bash
powershell -File tools/optimize.ps1 -Source in.png -Dest assets/img/out.jpg -MaxWidth 1400 -Quality 82
```

## Accessibility

Verified: single `h1` per page, sequential headings, alt text on every image, visible focus
rings, keyboard-operable menu with focus trap and Escape, all interactive targets ≥44px, and
every text/background pair meeting WCAG AA (4.5:1 body, 3:1 large display).

Gold is used decoratively — rules, borders, arrow glyphs — or as `--gold-ink` where it carries
text on a light ground. It is never set as light gold text on cream.

## QA

An automated sweep loads all five pages in an iframe at 1440, 1280, 1024, 768, 430, 390 and
375, scrolls each one to fire the reveals, then checks:

- horizontal overflow, and which element causes it
- elements left below full opacity, and masks that never opened
- broken images, and images displayed above their native width
- exactly one `h1` per page
- every link, button and field at 44px or taller
- computed contrast on every text node against its real painted background, at the AA
  threshold for its size and weight

Last run: 35 combinations, zero problems. Treatment rows were checked separately — all 34 rows
on the Services page share identical name, description and price offsets.

The sweep runs in a non-compositing tab, so `requestAnimationFrame` is starved and the reveal
failsafe correctly drops the gate. That is the safety net working, not a fault; it also means
the sweep cannot observe the animations themselves, only that nothing is left invisible.
