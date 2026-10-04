// File: scripts/home.js

let allProducts = [];

async function initHome() {
  updateCartCount();

  // 1. Kích hoạt Carousel Hero Banner
  initHeroCarousel();

  // 2. Kích hoạt đồng hồ đếm ngược Flash Sale
  initCountdownTimer();

  const grid = document.getElementById('product-grid');
  if (!grid) return;

  try {
    // 3. Gọi API lấy danh sách sản phẩm
    const res = await fetch('https://dummyjson.com/products?limit=190');
    const data = await res.json();

    const allowedCategories = [
      'laptops',
      'smartphones',
      'mobile-accessories',
      'tablets'
    ];

    const apiProducts = data.products
      .filter(p => allowedCategories.includes(p.category))
      .map(p => ({
        id: `dm-${p.id}`,
        title: p.title,
        price: Math.round(p.price * 25000),
        category: p.category,
        thumbnail: p.thumbnail
      }));

    // 4. Gộp dữ liệu Local và API
    const local = typeof localProducts !== 'undefined' ? localProducts : [];
    allProducts = [...local, ...apiProducts];

    // 5. Render Flash Sale (Lấy 4 sản phẩm đầu tiên)
    renderFlashSale(allProducts.slice(0, 4));

    // 6. Render danh sách sản phẩm chính trên Trang chủ
    renderProducts(allProducts);

  } catch (err) {
    console.error("Lỗi lấy dữ liệu API, chuyển sang dùng dữ liệu Local:", err);
    const local = typeof localProducts !== 'undefined' ? localProducts : [];
    allProducts = [...local];

    renderFlashSale(allProducts.slice(0, 4));
    renderProducts(allProducts);
  }

  // 7. Kích hoạt sidebar lọc danh mục
  setupFilters();

  // 8. Kích hoạt ô tìm kiếm trên Header
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase().trim();
      const filtered = allProducts.filter(p => p.title.toLowerCase().includes(keyword));
      renderProducts(filtered);
    });
  }
}

// ==========================================
// 1. ĐỒNG HỒ ĐẾM NGƯỢC FLASH SALE
// ==========================================
function initCountdownTimer() {
  // Đặt thời gian chạy: 3 tiếng (tính bằng giây)
  let duration = 3 * 60 * 60; 

  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  if (!hoursEl || !minutesEl || !secondsEl) return;

  const timer = setInterval(() => {
    let hours = Math.floor(duration / 3600);
    let minutes = Math.floor((duration % 3600) / 60);
    let seconds = Math.floor(duration % 60);

    hoursEl.textContent = hours < 10 ? '0' + hours : hours;
    minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
    secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;

    if (--duration < 0) {
      clearInterval(timer);
      duration = 3 * 60 * 60; // Reset lại vòng lặp mới khi hết giờ
    }
  }, 1000);
}

// ==========================================
// 2. RENDER KHU VỰC FLASH SALE
// ==========================================
function renderFlashSale(products) {
  const flashGrid = document.getElementById('flash-sale-grid');
  if (!flashGrid) return;

  if (products.length === 0) {
    flashGrid.innerHTML = `<p class="status-msg">Chưa có sản phẩm Flash Sale.</p>`;
    return;
  }

  flashGrid.innerHTML = products.map(p => `
    <div class="product-card">
      <a href="detail.html?id=${p.id}" class="product-link">
        <div class="product-image-box">
          <img src="${p.thumbnail}" alt="${p.title}" class="product-image" loading="lazy">
        </div>
        <div class="product-title">${p.title}</div>
      </a>
      <div class="product-bottom">
        <div class="product-price">${p.price.toLocaleString('vi-VN')}đ</div>
        <a href="detail.html?id=${p.id}" class="buy-btn">Mua ngay</a>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 3. CAROUSEL HERO BANNER
// ==========================================
function initHeroCarousel() {
  const tabs = document.querySelectorAll('.main-carousel .tab-item');
  const bannerImg = document.getElementById('carousel-img');
  const bannerLink = document.getElementById('banner-link');

  if (!tabs.length || !bannerImg || !bannerLink) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const newImg = tab.getAttribute('data-img');
      const newLink = tab.getAttribute('data-link');

      if (newImg) bannerImg.src = newImg;
      if (newLink) bannerLink.href = newLink;
    });
  });
}

// ==========================================
// 4. RENDER DANH SÁCH SẢN PHẨM CHÍNH
// ==========================================
function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `<p class="status-msg">Không tìm thấy sản phẩm nào khớp với tìm kiếm.</p>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <a href="detail.html?id=${p.id}" class="product-link">
        <div class="product-image-box">
          <img src="${p.thumbnail}" alt="${p.title}" class="product-image" loading="lazy">
        </div>
        <div class="product-title">${p.title}</div>
      </a>
      <div class="product-bottom">
        <div class="product-price">${p.price.toLocaleString('vi-VN')}đ</div>
        <a href="detail.html?id=${p.id}" class="buy-btn">Mua ngay</a>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 5. ĐIỀU HƯỚNG DANH MỤC
// ==========================================
function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.filter-btn');
      if (!targetBtn) return;

      const category = targetBtn.getAttribute('data-cat');

      if (category === 'all') {
        filterBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        renderProducts(allProducts);
      } else if (category) {
        window.location.href = `category.html?cat=${category}`;
      }
    });
  });
}

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', initHome);

// ==========================================
// 6. XỬ LÝ GIỎ HÀNG
// ==========================================
function updateCartCount() {}

function addToCart(productId) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (!currentUser) {
    if (typeof showAlert === 'function') {
      showAlert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', false, () => {
        window.location.href = './login.html';
      });
    } else {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      window.location.href = './login.html';
    }
    return;
  }

  let cart = JSON.parse(localStorage.getItem(`cart_${currentUser.username}`)) || [];

  if (typeof showAlert === 'function') {
    showAlert('Đã thêm sản phẩm vào giỏ hàng!', true);
  } else {
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  }
}