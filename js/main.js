/* ==========================================================================
   Kalakari Designs — main.js  (v2.1, interactive)
   Needs products.js loaded first. Vanilla JS, no build step.

   What lives here:
   1. helpers              6. shop page: filters, sub-categories, sort, URL sync
   2. toast                7. header: sticky shadow, mobile accordion menu
   3. wishlist             8. search overlay with live suggestions
   4. product cards        9. forms: inline validation, honeypot, char count
   5. quick view modal    10. extras: rails, reveal, back-to-top, sale timer, parallax
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const rupee = (n) => "₹" + new Intl.NumberFormat("en-IN").format(n);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const catById = (id) => CATEGORIES.find((c) => c.id === id);
  const prodById = (id) => PRODUCTS.find((p) => p.id === id);
  const groupById = (id) => GROUPS.find((g) => g.id === id);
  const lowPrice = (p) => (p.min != null ? p.min : p.price);
  const discount = (p) => (p.was ? Math.round((1 - p.price / p.was) * 100) : 0);
  const inGroup = (p, g) => (g.id === "gifts" ? !!p.gift : g.cats.includes(p.cat));
  const groupOfCat = (catId) => GROUPS.find((g) => g.cats.includes(catId));
  const svg = (name, cls) => `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  const HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5s-7.5-4.7-9-9.5A5 5 0 0 1 12 6.5 5 5 0 0 1 21 11c-1.5 4.8-9 9.5-9 9.5z"/></svg>';
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';
  const productIcon = (p) => { const c = catById(p.cat); return c ? c.icon : "gift"; };
  const priceHTML = (p) =>
    p.min != null ? `<span>${rupee(p.min)} – ${rupee(p.max)}</span>`
    : p.was ? `<span>${rupee(p.price)}</span><span class="pcard__was">${rupee(p.was)}</span>`
    : `<span>${rupee(p.price)}</span>`;
  const lockScroll = (on) => document.body.classList.toggle("is-locked", on);

  /* ---------- 2. toast ---------- */
  const toastEl = document.createElement("div");
  toastEl.className = "toast";
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");
  toastEl.innerHTML = "<span></span><a></a>";
  document.body.appendChild(toastEl);
  let toastTimer;
  function toast(msg, href, linkText) {
    toastEl.firstChild.textContent = msg;
    const a = toastEl.lastChild;
    a.textContent = href ? linkText : "";
    if (href) a.href = href; else a.removeAttribute("href");
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2800);
  }

  /* ---------- 3. wishlist (saved in this browser) ---------- */
  const WL_KEY = "kalakari_wishlist";
  const readWL = () => { try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; } catch (e) { return []; } };
  const writeWL = (list) => { try { localStorage.setItem(WL_KEY, JSON.stringify(list)); } catch (e) { /* storage blocked */ } };
  let wishlist = readWL().filter((id) => prodById(id));

  function updateWLBadge(bump) {
    $$("[data-wl-count]").forEach((b) => {
      b.textContent = wishlist.length;
      b.hidden = wishlist.length === 0;
      if (bump && !reduceMotion) { b.classList.remove("is-bump"); void b.offsetWidth; b.classList.add("is-bump"); }
    });
  }
  function syncWishButtons(id) {
    const on = wishlist.includes(id);
    const p = prodById(id);
    $$(`[data-wish="${id}"]`).forEach((b) => {
      b.setAttribute("aria-pressed", on);
      if (b.classList.contains("pcard__heart")) b.setAttribute("aria-label", `${on ? "Remove from" : "Add to"} wishlist: ${p.name}`);
      const label = b.querySelector("[data-wish-label]");
      if (label) label.textContent = on ? "Saved" : "Save to wishlist";
    });
  }
  function toggleWish(id, btn) {
    const p = prodById(id);
    if (!p) return;
    const adding = !wishlist.includes(id);
    wishlist = adding ? wishlist.concat(id) : wishlist.filter((x) => x !== id);
    writeWL(wishlist);
    syncWishButtons(id);
    updateWLBadge(adding);
    if (btn && adding && !reduceMotion) { btn.classList.remove("is-pop"); void btn.offsetWidth; btn.classList.add("is-pop"); }
    toast(adding ? "Saved to your wishlist" : "Removed from your wishlist", adding ? "shop.html?wishlist=1" : "", "View");
    if (typeof window.__redrawShop === "function" && new URLSearchParams(location.search).get("wishlist")) window.__redrawShop();
  }

  /* ---------- 4. product card ---------- */
  const NEW_IDS = new Set(HOME_NEW);
  const tagOf = (p) => (NEW_IDS.has(p.id) ? "NEW" : (p.was || p.min != null) ? "SALE" : "");

  function cardHTML(p, i) {
    const tag = tagOf(p);
    const saved = wishlist.includes(p.id);
    return `
      <article class="pcard">
        <div class="pcard__media tone-${i % 4}">
          ${tag ? `<span class="pcard__tag">${tag}</span>` : ""}
          <a class="pcard__link" href="${esc(p.url)}" aria-label="${esc(p.name)}">
            ${svg(productIcon(p), "pcard__icon")}
            <img src="assets/images/${p.id}.jpg" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">
          </a>
          <button class="pcard__heart" type="button" data-wish="${p.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove from" : "Add to"} wishlist: ${esc(p.name)}">${HEART}</button>
          <button class="pcard__quick" type="button" data-quick="${p.id}" aria-label="Quick view: ${esc(p.name)}">${EYE}<span>Quick view</span></button>
        </div>
        <h3 class="pcard__name"><a href="${esc(p.url)}">${esc(p.name)}</a></h3>
        <p class="pcard__price">${priceHTML(p)}</p>
      </article>`;
  }

  /* one delegated click handler for hearts + quick view on every page */
  document.addEventListener("click", (e) => {
    const w = e.target.closest("[data-wish]");
    if (w) { e.preventDefault(); toggleWish(w.dataset.wish, w); return; }
    const q = e.target.closest("[data-quick]");
    if (q) {
      e.preventDefault();
      const scope = q.closest(".grid, .rail, .search__results");
      const ids = scope ? $$("[data-quick]", scope).map((b) => b.dataset.quick) : [q.dataset.quick];
      quickView.open(q.dataset.quick, ids, q);
    }
  });

  /* ---------- 5. quick view modal ---------- */
  const quickView = (function () {
    const el = document.createElement("div");
    el.className = "qv";
    el.hidden = true;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "qv-title");
    el.innerHTML = `
      <div class="qv__panel">
        <button class="icon-btn qv__close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        <div class="qv__media"></div>
        <div class="qv__body">
          <a class="eyebrow qv__cat" href="#"></a>
          <h2 id="qv-title"></h2>
          <p class="qv__price"></p>
          <span class="qv__save"></span>
          <ul class="qv__perks">
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6h12v10H2zM14 9h4l3 3v4h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>Free delivery on orders above ₹499</li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/></svg>Kill Dill sale on Tuesdays</li>
            <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>Support resolved within 24 hrs</li>
          </ul>
          <div class="qv__cta">
            <a class="btn qv__buy" href="#">Buy now ${ARROW}</a>
            <button class="btn btn--outline qv__wish" type="button" aria-pressed="false">${HEART}<span data-wish-label>Save to wishlist</span></button>
          </div>
        </div>
        <div class="qv__nav">
          <button class="round-btn" type="button" data-qv="-1" aria-label="Previous product"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3 5 9l6 6"/></svg></button>
          <button class="round-btn" type="button" data-qv="1" aria-label="Next product"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 3 6 6-6 6"/></svg></button>
        </div>
      </div>`;
    document.body.appendChild(el);
    const panel = $(".qv__panel", el);
    let list = [], index = 0, returnTo = null;

    function render() {
      const p = prodById(list[index]);
      const cat = catById(p.cat);
      const tag = tagOf(p);
      const media = $(".qv__media", el);
      media.className = `qv__media tone-${(HOME_RECOMMENDED.indexOf(p.id) + 4) % 4}`;
      media.innerHTML = `${tag ? `<span class="pcard__tag">${tag}</span>` : ""}${svg(productIcon(p))}<img src="assets/images/${p.id}.jpg" alt="${esc(p.name)}" onerror="this.remove()">`;
      const catLink = $(".qv__cat", el);
      catLink.textContent = cat ? cat.name : "";
      catLink.href = cat ? `shop.html?cat=${cat.id}` : "shop.html";
      $("#qv-title", el).textContent = p.name;
      $(".qv__price", el).innerHTML = priceHTML(p);
      $(".qv__save", el).textContent = p.was ? `You save ${rupee(p.was - p.price)} (${discount(p)}% off)` : "";
      $(".qv__buy", el).href = p.url;
      $(".qv__wish", el).dataset.wish = p.id;
      syncWishButtons(p.id);
      $(".qv__nav", el).hidden = list.length < 2;
    }
    function step(d) { index = (index + d + list.length) % list.length; render(); }
    function open(id, ids, trigger) {
      list = ids && ids.length ? ids : [id];
      index = Math.max(0, list.indexOf(id));
      returnTo = trigger || document.activeElement;
      render();
      el.hidden = false;
      el.classList.add("is-open");
      lockScroll(true);
      $(".qv__close", el).focus();
    }
    function close() {
      if (el.hidden) return;
      el.hidden = true;
      el.classList.remove("is-open");
      lockScroll(false);
      if (returnTo && document.contains(returnTo)) returnTo.focus();
    }
    el.addEventListener("click", (e) => {
      if (e.target === el || e.target.closest(".qv__close")) close();
      const nav = e.target.closest("[data-qv]");
      if (nav) step(Number(nav.dataset.qv));
    });
    document.addEventListener("keydown", (e) => {
      if (el.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && list.length > 1) step(1);
      if (e.key === "ArrowLeft" && list.length > 1) step(-1);
      if (e.key === "Tab") {  // keep focus inside the dialog
        const f = $$("a[href], button:not([hidden])", panel).filter((n) => n.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    return { open, close };
  })();

  /* ---------- homepage ---------- */
  const fill = (sel, ids) => {
    const el = $(sel);
    if (el) el.innerHTML = ids.map(prodById).filter(Boolean).map(cardHTML).join("");
  };
  fill("#recommended-grid", HOME_RECOMMENDED);
  fill("#new-rail", HOME_NEW);

  const plural = (n) => `${n} ${n === 1 ? "product" : "products"}`;
  const groupsEl = $("#group-cards");
  if (groupsEl) {
    groupsEl.innerHTML = GROUPS.map((g, i) => `
      <a class="group g-${i}" href="shop.html?group=${g.id}">
        <div class="group__bg">${svg(g.icon)}</div>
        <img src="assets/images/group-${g.id}.jpg" alt="" loading="lazy" onerror="this.remove()">
        <small>${plural(PRODUCTS.filter((p) => inGroup(p, g)).length)}</small>
        <h3>${esc(g.name)}</h3>
        <span>Explore <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4"/></svg></span>
      </a>`).join("");
  }

  const tiersEl = $("#tier-cards");
  if (tiersEl) {
    tiersEl.innerHTML = TIERS.map((t) => `
      <a class="tier ${t.cls}" href="shop.html?price=${t.max}">
        <div class="tier__top"><small>UNDER</small><em>${plural(PRODUCTS.filter((p) => lowPrice(p) <= t.max).length)}</em></div>
        <div><b>${rupee(t.max)}</b><span>${t.label}</span></div>
      </a>`).join("");
  }

  /* ---------- 6. shop page ---------- */
  const shopGrid = $("#shop-grid");
  if (shopGrid) {
    const params = new URLSearchParams(location.search);
    const showWish = !!params.get("wishlist");
    const state = {
      group: params.get("group") || "all",
      cat: catById(params.get("cat")) ? params.get("cat") : "",
      price: Number(params.get("price")) || 0,
      q: params.get("q") || "",
      sort: params.get("sort") || "featured"
    };
    if (state.cat) state.group = (groupOfCat(state.cat) || { id: "all" }).id;
    if (!groupById(state.group)) state.group = "all";

    const groupChips = $("#group-chips");
    const catChips = $("#cat-chips");
    const priceChips = $("#price-chips");
    const search = $("#search");
    const sort = $("#sort");
    const count = $("#count");
    const title = $("#shop-title");
    const clearBtn = $("#clear-filters");
    search.value = state.q;
    if ($(`option[value="${state.sort}"]`, sort)) sort.value = state.sort; else state.sort = "featured";

    const base = () => PRODUCTS.filter((p) => !showWish || wishlist.includes(p.id));
    groupChips.innerHTML =
      `<button class="chip" type="button" data-group="all">All <small>${base().length}</small></button>` +
      GROUPS.map((g) => `<button class="chip" type="button" data-group="${g.id}">${esc(g.name)} <small>${base().filter((p) => inGroup(p, g)).length}</small></button>`).join("");
    priceChips.innerHTML =
      `<button class="chip" type="button" data-price="0">Any price</button>` +
      TIERS.map((t) => `<button class="chip" type="button" data-price="${t.max}">Under ${rupee(t.max)}</button>`).join("");

    function filtered() {
      const q = state.q.trim().toLowerCase();
      const g = groupById(state.group);
      let list = base().filter((p) => {
        if (state.cat && p.cat !== state.cat) return false;
        if (g && !inGroup(p, g)) return false;
        if (state.price && lowPrice(p) > state.price) return false;
        if (q) {
          const c = catById(p.cat);
          if (!(p.name + " " + (c ? c.name : "")).toLowerCase().includes(q)) return false;
        }
        return true;
      });
      if (state.sort === "low") list = list.slice().sort((a, b) => lowPrice(a) - lowPrice(b));
      if (state.sort === "high") list = list.slice().sort((a, b) => lowPrice(b) - lowPrice(a));
      if (state.sort === "discount") list = list.slice().sort((a, b) => discount(b) - discount(a));
      return list;
    }

    function syncURL() {
      const p = new URLSearchParams();
      if (showWish) p.set("wishlist", "1");
      if (state.cat) p.set("cat", state.cat);
      else if (state.group !== "all") p.set("group", state.group);
      if (state.price) p.set("price", state.price);
      if (state.q.trim()) p.set("q", state.q.trim());
      if (state.sort !== "featured") p.set("sort", state.sort);
      const qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
    }

    function draw() {
      const list = filtered();
      const g = groupById(state.group);
      const cat = catById(state.cat);

      groupChips.querySelectorAll("[data-group]").forEach((c) => {
        const on = c.dataset.group === state.group;
        c.classList.toggle("is-active", on); c.setAttribute("aria-pressed", on);
      });
      // sub-category chips for the selected group (only categories that have products)
      const subs = g ? g.cats.map(catById).filter((c) => c && base().some((p) => p.cat === c.id)) : [];
      catChips.hidden = subs.length < 2;
      if (!catChips.hidden) {
        catChips.innerHTML = `<button class="chip${state.cat ? "" : " is-active"}" type="button" data-cat="">All ${esc(g.name)}</button>` +
          subs.map((c) => `<button class="chip${c.id === state.cat ? " is-active" : ""}" type="button" data-cat="${c.id}">${esc(c.name)} <small>${base().filter((p) => p.cat === c.id).length}</small></button>`).join("");
      }
      priceChips.querySelectorAll("[data-price]").forEach((c) => {
        const on = Number(c.dataset.price) === state.price;
        c.classList.toggle("is-active", on); c.setAttribute("aria-pressed", on);
      });

      title.textContent = showWish ? "Your wishlist" : cat ? cat.name : g ? g.name : "All Products";
      document.title = `${title.textContent} | Kalakari Designs`;
      count.textContent = plural(list.length);
      const active = state.group !== "all" || state.cat || state.price || state.q.trim() || state.sort !== "featured";
      clearBtn.hidden = !active;

      shopGrid.classList.remove("is-fresh"); void shopGrid.offsetWidth; shopGrid.classList.add("is-fresh");
      shopGrid.innerHTML = list.length
        ? list.map(cardHTML).join("")
        : showWish && !wishlist.length
          ? `<div class="empty"><h3>Nothing saved yet</h3><p>Tap the heart on any product to save it here.</p><a class="btn" href="shop.html">Show products ${ARROW}</a></div>`
          : `<div class="empty"><h3>No products match</h3><p>Clear the search or choose another filter.</p><button class="btn" type="button" data-clear>Clear filters</button></div>`;
      syncURL();
    }
    window.__redrawShop = draw;

    function reset() {
      Object.assign(state, { group: "all", cat: "", price: 0, q: "", sort: "featured" });
      search.value = ""; sort.value = "featured";
      draw();
    }

    groupChips.addEventListener("click", (e) => {
      const b = e.target.closest("[data-group]");
      if (!b) return;
      state.group = b.dataset.group; state.cat = ""; draw();
    });
    catChips.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      state.cat = b.dataset.cat; draw();
    });
    priceChips.addEventListener("click", (e) => {
      const b = e.target.closest("[data-price]");
      if (!b) return;
      const v = Number(b.dataset.price);
      state.price = state.price === v ? 0 : v;  // click an active tier again to clear it
      draw();
    });
    let typing;
    search.addEventListener("input", () => { clearTimeout(typing); typing = setTimeout(() => { state.q = search.value; draw(); }, 140); });
    sort.addEventListener("change", () => { state.sort = sort.value; draw(); });
    clearBtn.addEventListener("click", reset);
    shopGrid.addEventListener("click", (e) => { if (e.target.closest("[data-clear]")) reset(); });
    draw();
  }

  /* ---------- 7. header: sticky shadow + mobile menu ---------- */
  const header = $(".site-header");
  const burger = $(".nav__burger");
  const mobileNav = window.matchMedia("(max-width: 1100px)");
  function setMenu(open) {
    header.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    lockScroll(open);
  }
  if (burger) {
    burger.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));
    $$(".nav__toggle").forEach((t) => t.addEventListener("click", () => {
      const item = t.closest(".nav__item");
      const open = item.classList.toggle("is-expanded");
      t.setAttribute("aria-expanded", open);
    }));
    $$(".nav__links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && header.classList.contains("is-open")) { setMenu(false); burger.focus(); } });
    document.addEventListener("click", (e) => { if (header.classList.contains("is-open") && !header.contains(e.target)) setMenu(false); });
    mobileNav.addEventListener("change", (e) => { if (!e.matches) setMenu(false); });
  }
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);
    toTop.classList.toggle("is-show", y > 700);
  };

  /* ---------- 8. search overlay with live suggestions ---------- */
  const searchBox = $(".search");
  const searchBtn = $("[data-search-open]");
  if (searchBox && searchBtn) {
    const input = $("input", searchBox);
    const results = $(".search__results", searchBox);
    let active = -1;
    const open = () => { searchBox.classList.add("is-open"); lockScroll(true); input.focus(); input.select(); suggest(); };
    const close = () => { if (!searchBox.classList.contains("is-open")) return; searchBox.classList.remove("is-open"); lockScroll(false); searchBtn.focus(); };

    function suggest() {
      const q = input.value.trim().toLowerCase();
      active = -1;
      if (!q) { results.innerHTML = ""; return; }
      const hits = PRODUCTS.filter((p) => {
        const c = catById(p.cat);
        return (p.name + " " + (c ? c.name : "")).toLowerCase().includes(q);
      }).slice(0, 5);
      results.innerHTML = hits.length
        ? hits.map((p, i) => `<li><button type="button" role="option" data-quick="${p.id}">
              <span class="search__thumb tone-${i % 4}">${svg(productIcon(p))}<img src="assets/images/${p.id}.jpg" alt="" onerror="this.remove()"></span>
              <span class="search__name">${esc(p.name)}<small>${esc((catById(p.cat) || {}).name || "")}</small></span>
              <span class="search__price">${rupee(lowPrice(p))}${p.min != null ? "+" : ""}</span></button></li>`).join("") +
          `<li><a class="search__all" href="shop.html?q=${encodeURIComponent(input.value.trim())}">See all results for “${esc(input.value.trim())}”</a></li>`
        : `<li class="search__none">No products found. Try “candle”, “planter” or “desk”.</li>`;
    }
    const options = () => $$("li > button, li > a", results);
    function highlight(d) {
      const o = options();
      if (!o.length) return;
      active = (active + d + o.length) % o.length;
      o.forEach((n, i) => n.classList.toggle("is-active", i === active));
      o[active].scrollIntoView({ block: "nearest" });
    }

    searchBtn.addEventListener("click", open);
    input.addEventListener("input", suggest);
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); highlight(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); highlight(-1); }
      else if (e.key === "Enter" && active > -1) { e.preventDefault(); options()[active].click(); }
    });
    results.addEventListener("click", (e) => {
      if (e.target.closest("[data-quick]")) { searchBox.classList.remove("is-open"); }  // quick view takes over
    });
    searchBox.addEventListener("click", (e) => { if (e.target === searchBox) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      const typing = /input|textarea|select/i.test(document.activeElement.tagName);
      if (e.key === "/" && !typing && !searchBox.classList.contains("is-open")) { e.preventDefault(); open(); }
    });
  }

  /* ---------- 9. forms (front-end only: connect to your backend / form service) ---------- */
  const SUB_KEY = "kalakari_subscribed";
  function fieldMessage(f) {
    if (f.validity.valueMissing) return f.type === "email" ? "Enter your email address." : "This field is required.";
    if (f.validity.typeMismatch) return "Enter a valid email address, like name@example.com.";
    if (f.validity.tooShort) return `Please write at least ${f.minLength} characters.`;
    return "";
  }
  $$("form[data-form]").forEach((form) => {
    const note = $(".form-note", form);
    const fields = $$("input[required], textarea[required]", form);
    const btn = $('button[type="submit"]', form);

    if (form.dataset.form === "newsletter") {
      try { if (localStorage.getItem(SUB_KEY)) note.textContent = "You’re on the list for Kill Dill sale updates."; } catch (e) { /* ignore */ }
    }
    // live character counter for textareas
    $$("[data-count-for]", form).forEach((c) => {
      const t = document.getElementById(c.dataset.countFor);
      const upd = () => { c.textContent = `${t.value.length}/${t.maxLength}`; };
      t.addEventListener("input", upd); upd();
    });
    fields.forEach((f) => f.addEventListener("input", () => {
      if (!f.classList.contains("is-invalid")) return;
      const msg = fieldMessage(f);
      if (!msg) { f.classList.remove("is-invalid"); f.removeAttribute("aria-invalid"); const err = f.parentElement.querySelector(".field__error"); if (err) err.textContent = ""; }
    }));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      note.classList.remove("is-error");
      let first = null;
      fields.forEach((f) => {
        const msg = fieldMessage(f);
        const err = f.closest(".field") ? $(".field__error", f.closest(".field")) : null;
        f.classList.toggle("is-invalid", !!msg);
        if (msg) f.setAttribute("aria-invalid", "true"); else f.removeAttribute("aria-invalid");
        if (err) err.textContent = msg;
        if (msg && !first) first = { f, msg };
      });
      if (first) {
        note.textContent = form.dataset.form === "newsletter" ? first.msg : "Check the highlighted fields and try again.";
        note.classList.add("is-error");
        first.f.focus();
        return;
      }
      const hp = $(".hp", form);
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending…";
      // TODO: send new FormData(form) to your endpoint (Formspree, Netlify Forms, Web3Forms, your API...)
      setTimeout(() => {
        btn.disabled = false; btn.textContent = label;
        if (hp && hp.value) { form.reset(); return; }  // bot filled the honeypot: pretend success, do nothing
        if (form.dataset.form === "newsletter") {
          try { localStorage.setItem(SUB_KEY, "1"); } catch (err) { /* ignore */ }
          note.textContent = "Done! Watch your inbox for the Kill Dill sale.";
          toast("Subscribed — 10% off is on its way");
        } else {
          note.textContent = "Message sent. We reply within 24 hours.";
        }
        form.reset();
        $$("[data-count-for]", form).forEach((c) => { const t = document.getElementById(c.dataset.countFor); c.textContent = `0/${t.maxLength}`; });
      }, 650);
    });
  });

  /* ---------- 10. extras ---------- */

  /* rails: arrow buttons (disabled at the ends), mouse drag, progress bar */
  function setupRail(rail, controls, progress) {
    const cardStep = () => {
      const c = rail.querySelector(".pcard");
      return c ? (c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 18)) * 2 : 480;
    };
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      if (controls) {
        const [prev, next] = $$("[data-dir]", controls);
        prev.disabled = rail.scrollLeft <= 2;
        next.disabled = rail.scrollLeft >= max - 2;
      }
      if (progress) {
        const bar = progress.firstElementChild;
        const visible = rail.clientWidth / rail.scrollWidth;
        const pos = max > 0 ? rail.scrollLeft / max : 0;
        bar.style.width = `${Math.max(visible, .12) * 100}%`;
        bar.style.transform = `translateX(${pos * (1 / Math.max(visible, .12) - 1) * 100}%)`;
        progress.hidden = max <= 2;
      }
    };
    if (controls) $$("[data-dir]", controls).forEach((btn) =>
      btn.addEventListener("click", () => rail.scrollBy({ left: Number(btn.dataset.dir) * cardStep(), behavior: reduceMotion ? "auto" : "smooth" })));
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    // drag to scroll with a mouse (touch already scrolls natively)
    let startX = 0, startLeft = 0, moved = false, down = false;
    rail.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("button")) return;
      down = true; moved = false; startX = e.clientX; startLeft = rail.scrollLeft;
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; rail.classList.add("is-dragging"); }
      if (moved) rail.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      if (moved) {
        rail.classList.remove("is-dragging");
        // let scroll-snap settle on the nearest card
        const c = rail.querySelector(".pcard");
        if (c) {
          const w = c.getBoundingClientRect().width + 18;
          rail.scrollTo({ left: Math.round(rail.scrollLeft / w) * w, behavior: reduceMotion ? "auto" : "smooth" });
        }
      }
    });
    rail.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    rail.addEventListener("dragstart", (e) => e.preventDefault());
  }
  $$("[data-rail]").forEach((controls) => {
    const rail = $(controls.dataset.rail);
    if (rail) setupRail(rail, controls, $(`[data-progress="${controls.dataset.rail}"]`));
  });
  const homeGrid = $("#recommended-grid");
  if (homeGrid) setupRail(homeGrid, null, null);  // becomes a rail on tablet; drag works there too

  /* reveal on scroll */
  const revealTargets = $$("main .sec-head, main .groups, main .grid--home, main .tiers, main .feature, main .story, main .rail, main .news, main .two-col, main .empty");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealTargets.forEach((t) => { t.setAttribute("data-reveal", ""); io.observe(t); });
  }

  /* back to top */
  const toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.type = "button";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 15V3M4 8l5-5 5 5"/></svg>';
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  document.body.appendChild(toTop);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Kill Dill sale timer — the sale runs on Tuesdays, counted in India time (IST, UTC+5:30) */
  const saleEls = $$("[data-sale-timer]");
  function saleTick() {
    const ist = new Date(Date.now() + 330 * 60000);           // shift to IST, then read UTC fields
    const day = ist.getUTCDay();
    const msToday = ((ist.getUTCHours() * 60 + ist.getUTCMinutes()) * 60 + ist.getUTCSeconds()) * 1000;
    const DAY = 86400000;
    const fmt = (ms) => {
      const m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
      return d ? `${d}d ${String(h).padStart(2, "0")}h` : `${h}h ${String(mm).padStart(2, "0")}m`;
    };
    const text = day === 2
      ? `Live now · ends in ${fmt(DAY - msToday)}`
      : `Next sale in ${fmt(((2 - day + 7) % 7) * DAY - msToday)}`;
    saleEls.forEach((el) => (el.textContent = text));
  }
  if (saleEls.length) { saleTick(); setInterval(saleTick, 30000); }

  /* gentle hero parallax on desktop pointers */
  const art = $("[data-parallax]");
  if (art && !reduceMotion && window.matchMedia("(hover: hover) and (min-width: 1001px)").matches) {
    const hero = art.closest(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      art.style.transform = `translate(${x * -14}px, ${y * -10}px) scale(1.03)`;
    });
    hero.addEventListener("pointerleave", () => { art.style.transform = ""; });
  }

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  updateWLBadge();
})();
