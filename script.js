// --- 1. Data Produk (5 Varian Sesuai Request) ---
const products = [
    { id: 1, name: "Classic Butter", category: "original", price: 22000, rating: 5, img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop", desc: "Wangi butter premium yang sangat kaya, renyah dan lumer di mulut." },
    { id: 2, name: "Midnight Choco Cookies", category: "Chocolate", price: 27000, rating: 5, img: "dark coklat.jpeg", desc: "Sensasi cokelat pekat ganda untuk para pencinta dark chocolate sejati." },
    { id: 3, name: "Red Velvet Dream", category: "Red Velvet", price: 30000, rating: 5, img: "https://images.unsplash.com/photo-1618923850106-920f3e8009b0?q=80&w=800&auto=format&fit=crop", desc: "Red velvet yang lembut dengan isian cream cheese yang gurih merata." },
    { id: 4, name: "Macha With White Choco", category: "Macha", price: 28000, rating: 5, img: "macha terbaru.jpeg", desc: "Rasa autentik matcha dipadu dengan kelembutan kepingan white chocolate." },
    { id: 5, name: "S'More", category: "Marshmallow", price: 26000, rating: 5, img: "https://images.unsplash.com/photo-1557310717-d6bea9f36682?q=80&w=800&auto=format&fit=crop", desc: "Perpaduan cookies renyah dengan isian marshmallow panggang yang lumer." }
];

// --- 2. Inisialisasi Keranjang ---
let cart = JSON.parse(localStorage.getItem('cookieCart')) || [];

// Format Rupiah
const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

// --- 3. Render Produk ---
const productGrid = document.getElementById('products-grid');

function renderProducts(data) {
    productGrid.innerHTML = '';
    if(data.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Produk tidak ditemukan.</p>';
        return;
    }
    data.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img">
                <img src="${product.img}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <p class="desc">${product.desc}</p>
                <div class="product-rating">${'★'.repeat(product.rating)}${'☆'.repeat(5-product.rating)}</div>
                <div class="product-price">${formatRp(product.price)}</div>
                <button class="btn-add-cart" onclick="addToCart(${product.id})">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}
renderProducts(products);

// --- 4. Fitur Filter & Search ---
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-product');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Active class toggle
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.getAttribute('data-filter');
        let filtered = products;
        if(category !== 'all') {
            filtered = products.filter(p => p.category === category);
        }
        renderProducts(filtered);
        searchInput.value = ''; 
    });
});

searchInput.addEventListener('keyup', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
    renderProducts(filtered);
    
    // Reset active button to "All"
    filterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
});

// --- 5. Logika Keranjang (Cart) ---
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountElement = document.querySelector('.cart-count');
const totalPriceElement = document.getElementById('total-price');

// Buka/Tutup Keranjang
cartIcon.addEventListener('click', () => {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
});
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
}

// Tambah ke keranjang
window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);
    
    if(existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    updateCartUI();
    saveCart();
    
    // Feedback visual
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
};

// Update Jumlah Qty
window.changeQty = (id, amount) => {
    const item = cart.find(i => i.id === id);
    if(item) {
        item.qty += amount;
        if(item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        updateCartUI();
        saveCart();
    }
};

// Hapus Item
window.removeItem = (id) => {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
    saveCart();
};

// Update Tampilan Keranjang
function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let totalQty = 0;
    let totalPrice = 0;

    if(cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Keranjang masih kosong</p>';
    }

    cart.forEach(item => {
        totalQty += item.qty;
        totalPrice += item.price * item.qty;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">${formatRp(item.price)}</div>
                <div class="cart-controls">
                    <button onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <i class="fa-solid fa-trash btn-remove" onclick="removeItem(${item.id})"></i>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartCountElement.innerText = totalQty;
    totalPriceElement.innerText = formatRp(totalPrice);
}

// Simpan ke LocalStorage
function saveCart() {
    localStorage.setItem('cookieCart', JSON.stringify(cart));
}

updateCartUI();

// --- 6. Checkout ke WhatsApp ---
const checkoutBtn = document.getElementById('checkout-btn');
// Nomor HP sudah diubah dari 0 menjadi 62 sesuai format API WhatsApp
const nomorWhatsApp = "6281239555010"; 

checkoutBtn.addEventListener('click', () => {
    if(cart.length === 0) {
        alert("Keranjang Anda masih kosong!");
        return;
    }

    let textWA = "Halo Cookie Bliss! Saya ingin memesan:\n\n";
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.qty;
        grandTotal += subtotal;
        textWA += `${index + 1}. *${item.name}* (x${item.qty}) - ${formatRp(subtotal)}\n`;
    });

    textWA += `\n*Total Belanja: ${formatRp(grandTotal)}*\n\n`;
    textWA += "Mohon info ketersediaan dan ongkos kirim. Terima kasih!";

    const encodedText = encodeURIComponent(textWA);
    const waURL = `https://wa.me/${nomorWhatsApp}?text=${encodedText}`;
    
    window.open(waURL, '_blank');
});

// --- 7. UI/UX Features ---

// Loading Animasi
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);
});

// Sticky Navbar & Back to Top
const header = document.getElementById('header');
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if(window.scrollY > 50) {
        header.classList.add('sticky');
        backToTopBtn.classList.add('show');
    } else {
        header.classList.remove('sticky');
        backToTopBtn.classList.remove('show');
    }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const isIconMenu = navLinks.classList.contains('active');
    menuToggle.innerHTML = isIconMenu ? '<i class="fa-solid fa-times"></i>' : '<i class="fa-solid fa-bars"></i>';
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
});

// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme');

if(currentTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if(body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
});

// Scroll Animation
const fadeElements = document.querySelectorAll('.fade-in');
const appearOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
    });
}, appearOptions);

fadeElements.forEach(el => appearOnScroll.observe(el));

// --- 8. Validasi Form Contact ---
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if(name === '' || email === '' || message === '') {
        formMessage.style.display = 'block';
        formMessage.style.color = 'red';
        formMessage.innerText = 'Semua field wajib diisi!';
        return;
    }

    formMessage.style.display = 'block';
    formMessage.style.color = 'green';
    formMessage.innerText = `Terima kasih ${name}, pesan Anda telah terkirim!`;
    contactForm.reset();
    
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 4000);
});

