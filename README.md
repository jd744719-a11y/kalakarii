# Kalakari Designs – website (static HTML / CSS / JS)

Warm editorial theme: off-white canvas, serif headlines, terracotta accent.
No build step. Plain files you can host anywhere (GitHub Pages ready).

## Run it locally
Double-click `index.html`, or serve the folder:

    python3 -m http.server 8000     # then visit http://localhost:8000

## Structure
    index.html  shop.html  about.html  blog.html  contact.html
    css/styles.css      all styling; colours, fonts, radii, spacing are tokens at the top (:root)
    js/products.js      ALL groups, categories, products, price tiers (edit here, every page updates)
    js/main.js          cards, quick view, wishlist, shop filters, search, menu, forms, rails, timers
    assets/images/      your photos (see below)

## What changed in v2.1
**Spacing and alignment**
- One vertical rhythm (`--section`) for every section; back-to-back sections no longer double their gap, and inline `padding-top:0` hacks are gone.
- Homepage "Recommended" grid is exactly 2 full rows of 5 on desktop; on tablet it becomes a swipeable rail and on phones a 2-column grid, so there are never half-empty rows.
- "What's new" rail shows 4.5 cards so it ends flush with the content edge; a progress bar sits underneath.
- Story images no longer spill outside their section; category and price cards stay 4-across on tablet instead of becoming oversized.
- Header switches to the burger menu at 1100px, so the six links never squeeze or overflow; footer columns no longer leave an empty cell on mobile.
- Product names reserve two lines so prices line up across a row.

**Interactive features**
- Quick view on every product card (hover on desktop, eye button on touch): price, savings, perks, Buy now, save to wishlist, ←/→ to browse, Esc to close.
- Wishlist toasts with a "View" shortcut and animated badge.
- Search overlay (click the icon or press `/`) with live product suggestions and arrow-key navigation.
- Shop page: sub-category chips per group, product counts on chips, "Biggest discount" sort, "Clear filters", and filters saved in the URL (shareable links).
- Mobile menu with expandable category sections; closes on link tap, outside tap or Esc.
- Kill Dill sale timer (counts to the next Tuesday in IST, or shows "Live now").
- Drag-to-scroll rails with arrow buttons that disable at the ends, scroll reveal, back-to-top button, gentle hero parallax, sticky-header shadow.
- Forms: inline error messages, honeypot spam field, message character counter, "Sending…" state.
- All motion is switched off for visitors who prefer reduced motion.

## Adding photos
Save images in `assets/images/`. They replace the placeholders automatically:

| File | Where it shows |
|---|---|
| `hero.jpg` | homepage hero (right side, wide landscape) |
| `group-home.jpg`, `group-desk.jpg`, `group-play.jpg`, `group-gifts.jpg` | "Shop by category" cards (portrait) |
| `<product-id>.jpg` e.g. `secret-candle.jpg` | product cards, quick view, search (4:5 portrait) – ids are in `js/products.js` |
| `candles.jpg` | candles banner |
| `story-1.jpg`, `story-2.jpg` | brand story section |

## Editing products
Open `js/products.js`. Each product has `id`, `name`, `cat`, `price` (+ `was` for a sale price) or `min`/`max` for a range,
`gift: true` to also list it under Gifts, and `url`.

## Still to finish before going live
- Product, cart and account links point to the live store (kalakaridesigns.com). This front-end has no checkout.
- Newsletter and contact forms are front-end only: connect them in `js/main.js` (search for `TODO`).
- Add support email / phone / address in `contact.html` (see TODO).
- Footer policy links (`#`) need real pages.
- Wishlist is saved in the visitor's browser only.
- Header and footer are repeated in each HTML file; edit all five when changing them.

## Publish on GitHub Pages
1. Create a public repository and upload everything in this folder (so `index.html` is at the top level).
2. Settings → Pages → Source: "Deploy from a branch" → Branch `main`, folder `/ (root)` → Save.
3. Your site appears at `https://<username>.github.io/<repo>/` in a minute or two.
