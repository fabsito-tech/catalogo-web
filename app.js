const products = [
  {id:'mug',name:'Taza cerámica',category:'Hogar',price:12500,oldPrice:15000,emoji:'☕',tag:'Favorito',bg:'#e9dfd0',rating:'★★★★★'},
  {id:'lamp',name:'Lámpara Nube',category:'Hogar',price:38900,emoji:'💡',tag:'Nuevo',bg:'#e9e5d8',rating:'★★★★★'},
  {id:'bottle',name:'Botella térmica',category:'Accesorios',price:22400,emoji:'🧴',tag:'Más elegido',bg:'#dce7df',rating:'★★★★☆'},
  {id:'headphones',name:'Auriculares Wave',category:'Tecnología',price:46900,emoji:'🎧',tag:'Nuevo',bg:'#e5dfe9',rating:'★★★★★'},
  {id:'backpack',name:'Mochila urbana',category:'Accesorios',price:54200,emoji:'🎒',tag:'Edición diaria',bg:'#e9dfd8',rating:'★★★★☆'},
  {id:'watch',name:'Reloj Minimal',category:'Accesorios',price:67500,emoji:'⌚',tag:'Favorito',bg:'#e2e5db',rating:'★★★★★'},
  {id:'speaker',name:'Parlante portátil',category:'Tecnología',price:31800,emoji:'🔊',tag:'Buen sonido',bg:'#e5e5db',rating:'★★★★☆'},
  {id:'plant',name:'Maceta de diseño',category:'Hogar',price:18900,emoji:'🪴',tag:'Para tu espacio',bg:'#e0e8d9',rating:'★★★★★'}
];
const formatPrice = value => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value);
const grid=document.querySelector('#product-grid');
const filterBox=document.querySelector('#filters');
const searchInput=document.querySelector('#search-input');
const sortSelect=document.querySelector('#sort-select');
const emptyState=document.querySelector('#empty-state');
const resultsLine=document.querySelector('#results-line');
const cartDrawer=document.querySelector('#cart-drawer');
const overlay=document.querySelector('#overlay');
const cartItems=document.querySelector('#cart-items');
const cartEmpty=document.querySelector('#cart-empty');
const cartFooter=document.querySelector('#cart-footer');
const toast=document.querySelector('#toast');
let activeCategory='Todos';
let cart=JSON.parse(localStorage.getItem('esquina-cart')||'{}');
let toastTimer;

function renderFilters(){
  const categories=['Todos',...new Set(products.map(product=>product.category))];
  filterBox.innerHTML=categories.map(category=>`<button class="filter-button ${category===activeCategory?'active':''}" data-category="${category}" aria-pressed="${category===activeCategory}">${category}</button>`).join('');
}
function renderProducts(){
  const query=searchInput.value.trim().toLocaleLowerCase('es');
  let shown=products.filter(product=>(activeCategory==='Todos'||product.category===activeCategory)&&(`${product.name} ${product.category} ${product.tag}`).toLocaleLowerCase('es').includes(query));
  if(sortSelect.value==='price-asc')shown=[...shown].sort((a,b)=>a.price-b.price);
  if(sortSelect.value==='price-desc')shown=[...shown].sort((a,b)=>b.price-a.price);
  grid.innerHTML=shown.map(product=>`<article class="product-card"><div class="product-art" style="--card-bg:${product.bg}"><span class="product-tag">${product.tag}</span><span class="product-emoji" aria-hidden="true">${product.emoji}</span><button class="quick-add" data-add="${product.id}" aria-label="Agregar ${product.name} al carrito">+</button></div><div class="product-info"><p class="product-category">${product.category}</p><h3 class="product-name">${product.name}</h3><div class="product-bottom"><span class="product-price">${formatPrice(product.price)}${product.oldPrice?`<span class="product-old-price">${formatPrice(product.oldPrice)}</span>`:''}</span><span class="rating" aria-label="Valoración">${product.rating}</span></div></div></article>`).join('');
  emptyState.hidden=shown.length>0;
  grid.hidden=shown.length===0;
  resultsLine.textContent=`${shown.length} ${shown.length===1?'producto':'productos'}`;
}
function saveCart(){localStorage.setItem('esquina-cart',JSON.stringify(cart));renderCart();}
function addToCart(id){cart[id]=(cart[id]||0)+1;saveCart();const product=products.find(item=>item.id===id);showToast(`${product.name} se agregó al carrito`);}
function renderCart(){
  const entries=Object.entries(cart).filter(([,quantity])=>quantity>0);
  const count=entries.reduce((sum,[,quantity])=>sum+quantity,0);
  document.querySelector('#cart-count').textContent=count;
  document.querySelector('#drawer-count').textContent=`(${count})`;
  cartEmpty.hidden=entries.length>0;
  cartFooter.hidden=entries.length===0;
  cartItems.innerHTML=entries.map(([id,quantity])=>{const product=products.find(item=>item.id===id);if(!product)return '';return `<article class="cart-line"><div class="cart-thumb" aria-hidden="true">${product.emoji}</div><div><h3>${product.name}</h3><p>${formatPrice(product.price)}</p><div class="quantity-control"><button data-quantity="${id}" data-delta="-1" aria-label="Quitar una unidad de ${product.name}">−</button><span>${quantity}</span><button data-quantity="${id}" data-delta="1" aria-label="Agregar una unidad de ${product.name}">+</button><button class="remove-item" data-remove="${id}">Quitar</button></div></div><strong>${formatPrice(product.price*quantity)}</strong></article>`;}).join('');
  const total=entries.reduce((sum,[id,quantity])=>sum+(products.find(item=>item.id===id)?.price||0)*quantity,0);
  document.querySelector('#cart-total').textContent=formatPrice(total);
}
function showCart(){cartDrawer.classList.add('open');cartDrawer.setAttribute('aria-hidden','false');overlay.hidden=false;requestAnimationFrame(()=>overlay.classList.add('visible'));document.body.style.overflow='hidden';document.querySelector('#close-cart').focus();}
function hideCart(){cartDrawer.classList.remove('open');cartDrawer.setAttribute('aria-hidden','true');overlay.classList.remove('visible');document.body.style.overflow='';setTimeout(()=>{overlay.hidden=true},220);}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200);}
filterBox.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;renderFilters();renderProducts();});
searchInput.addEventListener('input',renderProducts);
sortSelect.addEventListener('change',renderProducts);
grid.addEventListener('click',event=>{const button=event.target.closest('[data-add]');if(button)addToCart(button.dataset.add);});
document.querySelector('#open-cart').addEventListener('click',showCart);
document.querySelector('#close-cart').addEventListener('click',hideCart);
document.querySelector('#keep-shopping').addEventListener('click',hideCart);
overlay.addEventListener('click',hideCart);
cartItems.addEventListener('click',event=>{const quantityButton=event.target.closest('[data-quantity]');const removeButton=event.target.closest('[data-remove]');if(quantityButton){const id=quantityButton.dataset.quantity;cart[id]=(cart[id]||0)+Number(quantityButton.dataset.delta);if(cart[id]<=0)delete cart[id];saveCart();}if(removeButton){delete cart[removeButton.dataset.remove];saveCart();}});
document.querySelector('#checkout-button').addEventListener('click',()=>{const lines=Object.entries(cart).filter(([,quantity])=>quantity>0).map(([id,quantity])=>{const product=products.find(item=>item.id===id);return `${quantity} × ${product.name} — ${formatPrice(product.price*quantity)}`;});const total=Object.entries(cart).reduce((sum,[id,quantity])=>sum+(products.find(item=>item.id===id)?.price||0)*quantity,0);window.alert(`Resumen de tu pedido:\n\n${lines.join('\n')}\n\nTotal: ${formatPrice(total)}\n\nEsta es una demo: todavía no se envían pedidos.`);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&cartDrawer.classList.contains('open'))hideCart();});
renderFilters();renderProducts();renderCart();
