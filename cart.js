/* ============================================================
   DECO'IN — Panier partagé (cart.js)
   À inclure sur TOUTES les pages avant </body>
   ============================================================ */

// ---------- DONNÉES ----------
function getCart() {
  try { return JSON.parse(localStorage.getItem('decoin_cart')) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('decoin_cart', JSON.stringify(cart));
}

// ---------- ACTIONS ----------
function addToCart(product) {
  // product = { id, name, price, unit, img, cat }
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  openCartDrawer();
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartUI();
  renderCartDrawer();
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    saveCart(cart);
    updateCartUI();
    renderCartDrawer();
  }
}

// ---------- UI : COMPTEUR ----------
function updateCartUI() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ---------- DRAWER ----------
function buildDrawer() {
  if (document.getElementById('cart-drawer')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <!-- Overlay -->
    <div id="cart-overlay" onclick="closeCartDrawer()" style="
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,0.45); z-index:999;
    "></div>

    <!-- Drawer -->
    <div id="cart-drawer" style="
      position:fixed; top:0; right:0; height:100%;
      width:min(420px, 95vw); background:#fff;
      z-index:1000; transform:translateX(100%);
      transition:transform 0.35s cubic-bezier(.4,0,.2,1);
      display:flex; flex-direction:column;
      box-shadow:-4px 0 30px rgba(0,0,0,0.12);
      font-family:'Jost',sans-serif;
    ">
      <!-- Header -->
      <div style="
        display:flex; align-items:center; justify-content:space-between;
        padding:24px 28px; border-bottom:1px solid #ece8e0;
        background:#1a1714;
      ">
        <div>
          <div style="font-size:0.68rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;margin-bottom:4px">Mon panier</div>
          <div id="drawer-count" style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:600;color:#fff">0 article</div>
        </div>
        <button onclick="closeCartDrawer()" style="
          background:rgba(255,255,255,0.08); border:none; color:#fff;
          width:38px; height:38px; border-radius:50%; font-size:1.2rem;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:background 0.2s;
        " onmouseover="this.style.background='rgba(201,169,110,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">✕</button>
      </div>

      <!-- Items -->
      <div id="drawer-items" style="flex:1; overflow-y:auto; padding:0"></div>

      <!-- Footer -->
      <div id="drawer-footer" style="
        border-top:1px solid #ece8e0; padding:24px 28px;
        background:#f9f7f4;
      "></div>
    </div>
  `);
}

function renderCartDrawer() {
  const cart = getCart();
  const itemsEl = document.getElementById('drawer-items');
  const footerEl = document.getElementById('drawer-footer');
  const countEl = document.getElementById('drawer-count');
  if (!itemsEl) return;

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + parseFloat(i.price.replace(',','.')) * i.qty, 0);

  countEl.textContent = totalQty + ' article' + (totalQty > 1 ? 's' : '');

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px;text-align:center;color:#6b6560">
        <div style="font-size:3rem;margin-bottom:16px;opacity:0.4">🛒</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:600;color:#2a2520;margin-bottom:8px">Votre panier est vide</div>
        <div style="font-size:0.85rem;font-weight:300;line-height:1.6">Découvrez nos produits et ajoutez vos favoris ici.</div>
        <a href="produits.html" onclick="closeCartDrawer()" style="
          display:inline-block;margin-top:24px;
          background:#c9a96e;color:#fff;
          padding:12px 28px;font-size:0.8rem;font-weight:500;
          letter-spacing:1px;text-transform:uppercase;
          text-decoration:none;border:2px solid #c9a96e;
          transition:all 0.3s;
        " onmouseover="this.style.background='transparent';this.style.color='#c9a96e'" onmouseout="this.style.background='#c9a96e';this.style.color='#fff'">Voir les produits</a>
      </div>`;
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div style="
      display:grid; grid-template-columns:80px 1fr auto;
      gap:16px; align-items:center;
      padding:18px 28px; border-bottom:1px solid #f0ede8;
      transition:background 0.2s;
    " onmouseover="this.style.background='#f9f7f4'" onmouseout="this.style.background=''">
      <img src="${item.img}" alt="${item.name}" style="width:80px;height:60px;object-fit:cover;background:#f0ede8">
      <div>
        <div style="font-size:0.68rem;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#c9a96e;margin-bottom:3px">${item.cat}</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:600;color:#2a2520;line-height:1.3;margin-bottom:8px">${item.name}</div>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="display:flex;align-items:center;border:1px solid #ddd;background:#fff">
            <button onclick="changeQty(${item.id},-1)" style="width:28px;height:28px;border:none;background:none;cursor:pointer;font-size:1rem;color:#6b6560;transition:color 0.2s" onmouseover="this.style.color='#c9a96e'" onmouseout="this.style.color='#6b6560'">−</button>
            <span style="padding:0 10px;font-size:0.85rem;font-weight:500;min-width:20px;text-align:center">${item.qty}</span>
            <button onclick="changeQty(${item.id},1)" style="width:28px;height:28px;border:none;background:none;cursor:pointer;font-size:1rem;color:#6b6560;transition:color 0.2s" onmouseover="this.style.color='#c9a96e'" onmouseout="this.style.color='#6b6560'">+</button>
          </div>
          <button onclick="removeFromCart(${item.id})" style="background:none;border:none;cursor:pointer;font-size:0.75rem;color:#aaa;text-decoration:underline;transition:color 0.2s" onmouseover="this.style.color='#e44'" onmouseout="this.style.color='#aaa'">Retirer</button>
        </div>
      </div>
      <div style="text-align:right;font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;color:#2a2520;white-space:nowrap">
        ${(parseFloat(item.price.replace(',','.')) * item.qty).toFixed(2).replace('.',',')} €
        <div style="font-family:'Jost',sans-serif;font-size:0.72rem;font-weight:300;color:#6b6560">${item.price} €/${item.unit}</div>
      </div>
    </div>
  `).join('');

  footerEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:0.82rem;color:#6b6560;font-weight:300">Livraison estimée</span>
      <span style="font-size:0.82rem;color:#6b6560;font-weight:300">${totalPrice >= 80 ? '<span style="color:#2a9d8f;font-weight:500">Offerte 🎉</span>' : 'à partir de 5,90 €'}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px;padding-top:12px;border-top:1px solid #ece8e0">
      <span style="font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600">Total</span>
      <span style="font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:600;color:#2a2520">${totalPrice.toFixed(2).replace('.',',')} €</span>
    </div>
    <button onclick="alert('Paiement en cours d\'intégration — Stripe arrive bientôt !')" style="
      width:100%;padding:16px;background:#c9a96e;color:#fff;
      border:2px solid #c9a96e;font-family:'Jost',sans-serif;
      font-size:0.85rem;font-weight:600;letter-spacing:1px;
      text-transform:uppercase;cursor:pointer;transition:all 0.3s;
      margin-bottom:10px;
    " onmouseover="this.style.background='transparent';this.style.color='#c9a96e'" onmouseout="this.style.background='#c9a96e';this.style.color='#fff'">
      Passer la commande →
    </button>
    <button onclick="if(confirm('Vider le panier ?')){localStorage.removeItem('decoin_cart');updateCartUI();renderCartDrawer();}" style="
      width:100%;padding:10px;background:transparent;color:#aaa;
      border:1px solid #ddd;font-family:'Jost',sans-serif;
      font-size:0.75rem;font-weight:400;letter-spacing:0.5px;
      cursor:pointer;transition:all 0.2s;
    " onmouseover="this.style.borderColor='#c9a96e';this.style.color='#c9a96e'" onmouseout="this.style.borderColor='#ddd';this.style.color='#aaa'">
      Vider le panier
    </button>
    ${totalPrice < 80 ? `<div style="text-align:center;font-size:0.75rem;color:#6b6560;margin-top:12px;font-weight:300">Plus que ${(80-totalPrice).toFixed(2).replace('.',',')} € pour la livraison offerte</div>` : ''}
  `;
}

function openCartDrawer() {
  renderCartDrawer();
  document.getElementById('cart-drawer').style.transform = 'translateX(0)';
  document.getElementById('cart-overlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  document.getElementById('cart-drawer').style.transform = 'translateX(100%)';
  document.getElementById('cart-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  buildDrawer();
  updateCartUI();

  // Brancher TOUS les liens panier de la page
  document.querySelectorAll('.nav-icon').forEach(el => {
    if (el.textContent.includes('🛒') || el.querySelector('.cart-count')) {
      el.href = '#';
      el.addEventListener('click', e => {
        e.preventDefault();
        openCartDrawer();
      });
    }
  });
});
