/* ==========================================================================
   Kalakari Designs — products.js
   Single source of truth for groups, categories and products.
   Edit here and every page updates.

   IMAGES: save a photo as  assets/images/<product-id>.jpg  (e.g. secret-candle.jpg)
   and it replaces the placeholder automatically. Same for group cards
   (group-home.jpg, group-desk.jpg, group-play.jpg, group-gifts.jpg),
   hero.jpg, candles.jpg, story-1.jpg and story-2.jpg.

   PRICES: use  price (+ was)  for one price / a sale, or  min + max  for a range.
   gift: true  also lists the product under "Gifts".
   url: where the product opens (currently your live store).
   ========================================================================== */

const STORE = "https://kalakaridesigns.com";

/* Minimal line icons used as image placeholders */
const ICONS = {
  candle: '<rect x="8" y="10" width="8" height="10" rx="1.5"/><path class="flame" d="M12 3c1.6 1.8 1.6 3.2 0 4.2-1.6-1-1.6-2.4 0-4.2z"/><path d="M12 7.5V10"/>',
  plant: '<path d="M7 14h10l-1.2 6H8.2z"/><path d="M12 14V8"/><path d="M12 10c-3 0-4.5-1.6-4.5-4 3 0 4.5 1.6 4.5 4zM12 8c0-2.6 1.5-4.2 4.5-4.2 0 2.6-1.5 4.2-4.5 4.2z"/>',
  key: '<circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H21M18 12v3M15 12v2"/>',
  coaster: '<ellipse cx="12" cy="9" rx="8" ry="3"/><path d="M4 9v3c0 1.7 3.6 3 8 3s8-1.3 8-3V9"/><path d="M4 12v3c0 1.7 3.6 3 8 3s8-1.3 8-3v-3"/>',
  magnet: '<path d="M5 4v8a7 7 0 0 0 14 0V4h-4v8a3 3 0 0 1-6 0V4z"/><path d="M5 8h4M15 8h4"/>',
  toy: '<circle cx="7" cy="6" r="2"/><circle cx="17" cy="6" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="10" cy="11" r=".6"/><circle cx="14" cy="11" r=".6"/><path d="M10.5 14c.8.6 2.2.6 3 0"/>',
  desk: '<rect x="3" y="12" width="7" height="8" rx="1"/><path d="M5 12V6M8 12V4"/><rect x="13" y="5" width="8" height="15" rx="2"/><path d="M16.5 17h1"/>',
  jewel: '<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M9 4l-2 5 5 11 5-11-2-5"/>',
  frame: '<rect x="4" y="4" width="16" height="16" rx="1"/><rect x="8" y="8" width="8" height="8"/>',
  bath: '<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M6 12V6a2 2 0 0 1 4 0"/><path d="M7 19l-1 2M17 19l1 2"/>',
  kitchen: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10"/><path d="M16 3c-2 2-3 5-3 8h3v10"/>',
  game: '<rect x="3" y="8" width="18" height="9" rx="4.5"/><path d="M8 10.5v4M6 12.5h4"/><circle cx="15.5" cy="11.5" r=".8"/><circle cx="18" cy="13.5" r=".8"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18V6H3zM12 6v14"/><path d="M12 6c-1-3-5-3-4.5-.5.3 1.5 2.5.5 4.5.5zM12 6c1-3 5-3 4.5-.5-.3 1.5-2.5.5-4.5.5z"/>'
};

/* The four storefront groups. `cats` lists the real Kalakari categories inside each. */
const GROUPS = [
  { id: "home", name: "Home & Living",      icon: "candle", cats: ["candles", "planters", "coasters", "fridge-magnets", "wall-decor", "bathroom", "kitchen", "jewelry-box"] },
  { id: "desk", name: "Desk & Workspace",   icon: "desk",   cats: ["desk-gadgets"] },
  { id: "play", name: "Collectibles & Play", icon: "game",  cats: ["toys", "gaming", "key-chains"] },
  { id: "gifts", name: "Gifts",             icon: "gift",   cats: [] }
];

/* Real categories from kalakaridesigns.com */
const CATEGORIES = [
  { id: "candles",        name: "Candles",                           icon: "candle",  url: STORE + "/product-category/candles/" },
  { id: "planters",       name: "Planters",                          icon: "plant",   url: STORE + "/product-category/planters/" },
  { id: "key-chains",     name: "Key Chains",                        icon: "key",     url: STORE + "/product-category/key-chains/" },
  { id: "coasters",       name: "Coasters",                          icon: "coaster", url: STORE + "/product-category/coasters/" },
  { id: "fridge-magnets", name: "Fridge Magnets",                    icon: "magnet",  url: STORE + "/product-category/fridge-magnets/" },
  { id: "toys",           name: "Toys",                              icon: "toy",     url: STORE + "/product-category/cute-toys/" },
  { id: "desk-gadgets",   name: "Office Desk Decorators",            icon: "desk",    url: STORE + "/product-category/desk-gadgets/" },
  { id: "jewelry-box",    name: "Jewelry Box",                       icon: "jewel",   url: STORE + "/product-category/jewelry-box/" },
  { id: "wall-decor",     name: "Wall Decor",                        icon: "frame",   url: STORE + "/product-category/wall-decor/" },
  { id: "bathroom",       name: "Sophisticated Bathroom Solutions",  icon: "bath",    url: STORE + "/product-category/sophisticated-bathroom-solutions/" },
  { id: "kitchen",        name: "Kitchen",                           icon: "kitchen", url: STORE + "/product-category/kitchen/" },
  { id: "gaming",         name: "Gaming",                            icon: "game",    url: STORE + "/product-category/gaming/" }
];

const PRODUCTS = [
  { id: "secret-candle",  name: "Secret Message Candle",                 cat: "candles",      price: 399,  was: 1100, gift: true, url: STORE + "/product/secret-message-candle/" },
  { id: "sorting-hat-candle", name: "Sorting Hat Candle",                cat: "candles",      price: 800,  was: 2500, gift: true, url: STORE + "/product/sorting-hat-candle/" },
  { id: "cat-jewellery-box", name: "Cute Cat Shaped Jewellery Box (3 Compartments)", cat: "jewelry-box", price: 950, was: 2100, gift: true, url: STORE + "/product/cute-cat-shaped-jewellery-box-3-compartments/" },
  { id: "desk-organizer", name: "Multi-Purpose Desk Organizer – Pen Stand, Plant Pot & Makeup Holder", cat: "desk-gadgets", price: 1190, was: 1499, url: STORE + "/product/multi-purpose-desk-organizer/" },
  { id: "toothbrush-holder", name: "Elegant Modern Toothbrush Holder (3 pc set)", cat: "bathroom", price: 650, was: 1100, url: STORE + "/product/elegant-modern-toothbrush-holder/" },
  { id: "bathroom-organizer", name: "Modern Bathroom Organizer, Eco-Friendly PLA (Black)", cat: "bathroom", price: 999, was: 1200, url: STORE + "/product/modern-bathroom-organizer/" },
  { id: "makeup-organizer", name: "Spinning Makeup Organizer – Black, White, Beige & Marble", cat: "bathroom", price: 950, url: STORE + "/product/makeup-organizer/" },
  { id: "crochet-flowers", name: "Elegant Crochet Flower Gift – Sunflower, Cactus, Tulip & Jasmine", cat: "planters", min: 550, max: 650, gift: true, url: STORE + "/product/elegant-crochet-flower-gifts-sunflower-cactus-tulip-jasmine/" },
  { id: "crumpled-pot",   name: "Crumpled Look Flower Pot – Indoor Planter for Desk or Shelf", cat: "planters", min: 380, max: 390, url: STORE + "/product/crumpled-look-flower-pot-stylish-indoor-planter-for-desk-or-shelf/" },
  { id: "plant-stand",    name: "Decorative Desk Plant Stands – Modern Style", cat: "desk-gadgets", price: 499, was: 1400, url: STORE + "/product/decorative-desk-plant-stands-modern-style/" },
  { id: "mario-stand",    name: "Mario PS5 Controller Stand",           cat: "gaming",       min: 660, max: 1990, url: STORE + "/product/mario-ps5-controller-stand/" },
  { id: "fries-clips",    name: "French Fries Shaped Bag Sealing Clips (Set of 10)", cat: "kitchen", price: 410, was: 560, url: STORE + "/product/bag-sealing-clips/" },
  { id: "one-wish-willow", name: "One Wish Willow Collectible Toy",     cat: "toys",         price: 250, was: 499, gift: true, url: STORE + "/product/one-wish-willow-vintage-novelty-toy-breakable-wooden-wish-stick-gag-gift-retro-party-trick-for-kids-and-adults/" },
  { id: "motivation-sign", name: "Motivation Sign – “Stop Being POOR”", cat: "wall-decor",   min: 399, max: 499, url: STORE + "/product/motivation-sign-stop-being-poor/" }
];

/* Homepage lists, same order as kalakaridesigns.com (by id) */
const HOME_RECOMMENDED = ["one-wish-willow", "mario-stand", "fries-clips", "desk-organizer", "toothbrush-holder", "bathroom-organizer", "crochet-flowers", "cat-jewellery-box", "motivation-sign", "secret-candle"];
const HOME_NEW = ["toothbrush-holder", "desk-organizer", "crumpled-pot", "cat-jewellery-box", "sorting-hat-candle", "secret-candle", "crochet-flowers", "makeup-organizer", "fries-clips", "plant-stand"];

/* Price tiers shown on "Discover by price" and the shop filter */
const TIERS = [
  { max: 499,  label: "Finds Under ₹499",     cls: "tier--sage" },
  { max: 999,  label: "Favourites Under ₹999", cls: "tier--sand" },
  { max: 1499, label: "Upgrades Under ₹1,499", cls: "tier--terra" },
  { max: 2499, label: "Special Picks Under ₹2,499", cls: "tier--dark" }
];
