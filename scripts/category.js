// File: scripts/category.js

let categoryProducts = [];
let currentCategory = '';

// Ánh xạ tên hiển thị tiếng Việt
const categoryNames = {
  'smartphones': 'Điện thoại',
  'laptops': 'Máy tính Laptop',
  'tablets': 'Máy tính bảng',
  'mobile-accessories': 'Phụ kiện công nghệ'
};

// Hàm chuẩn hóa tên Brand từ Title/Brand sản phẩm
function detectBrand(product) {
  const title = (product.title || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();

  // 1. ƯU TIÊN CAO NHẤT: Bắt toàn bộ Xiaomi, Redmi và Realme (từ API) rồi chuyển sạch thành "Xiaomi"
  if (
    title.includes('xiaomi') || 
    title.includes('redmi') || 
    title.includes('realme') || 
    brand.includes('xiaomi') || 
    brand.includes('redmi') || 
    brand.includes('realme')
  ) {
    return 'Xiaomi';
  }

  // 2. Sau đó mới xét brand gốc đã chuẩn (từ localProducts hoặc API)
  if (product.brand) {
    return product.brand.charAt(0).toUpperCase() + product.brand.slice(1);
  }

  // 3. Dự phòng cho các hãng khác nếu dữ liệu API thiếu brand
  if (title.includes('iphone') || title.includes('ipad') || title.includes('macbook')) return 'Apple';
  if (title.includes('samsung') || title.includes('galaxy')) return 'Samsung';
  if (title.includes('oppo')) return 'Oppo';

  return 'Khác';
}

async function initCategoryPage() {
  // 1. Lấy tham số 'cat' trên URL (Ví dụ: category.html?cat=smartphones)
  const urlParams = new URLSearchParams(window.location.search);
  currentCategory = urlParams.get('cat') || 'smartphones';

  // Cập nhật tiêu đề trang danh mục
  const titleElem = document.getElementById('category-name');
  if (titleElem) {
    titleElem.textContent = categoryNames[currentCategory] || 'Danh Mục Sản Phẩm';
  }

  // 2. Lấy sản phẩm từ nguồn LOCAL trước và chuẩn hóa brand
  const localFiltered = (typeof localProducts !== 'undefined' ? localProducts : [])
    .filter(p => p.category === currentCategory)
    .map(p => ({
      ...p,
      brand: detectBrand(p)
    }));

  // 3. Lấy sản phẩm từ API DummyJSON và chuẩn hóa brand
  let apiFiltered = [];
  try {
    const res = await fetch(`https://dummyjson.com/products/category/${currentCategory}`);
    if (res.ok) {
      const data = await res.json();
      apiFiltered = data.products.map(p => {
        const normalizedBrand = detectBrand(p);
        return {
          id: `dm-${p.id}`,
          title: p.title,
          brand: normalizedBrand,
          price: Math.round(p.price * 25000),
          category: p.category,
          thumbnail: p.thumbnail
        };
      });
    }
  } catch (err) {
    console.error("Không thể kết nối API, chỉ sử dụng nguồn Local:", err);
  }

  // 4. GỘP CẢ LOCAL VÀ API LẠI LÀM MỘT
  categoryProducts = [...localFiltered, ...apiFiltered];

  // 5. Hiển thị bộ lọc Thương hiệu & Danh sách sản phẩm
  renderBrandFilters(categoryProducts);
  renderProducts(categoryProducts);

  // 6. Xử lý tìm kiếm trên Header
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase().trim();
      const filtered = categoryProducts.filter(p => p.title.toLowerCase().includes(keyword));
      renderProducts(filtered);
    });
  }
}

// Hàm render thanh Filter Thương hiệu (Apple, Samsung, Xiaomi,...)
function renderBrandFilters(products) {
  const brandListElem = document.getElementById('brand-list');
  if (!brandListElem) return;

  // Tự động gom tất cả các Thương hiệu có trong danh sách
  const brands = ['Tất cả', ...new Set(products.map(p => p.brand).filter(Boolean))];

  brandListElem.innerHTML = brands.map((brand, index) => `
    <button class="brand-btn ${index === 0 ? 'active' : ''}" data-brand="${brand}">
      ${brand}
    </button>
  `).join('');

  // Lắng nghe sự kiện click nút Filter Brand
  const brandBtns = brandListElem.querySelectorAll('.brand-btn');
  brandBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      brandBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedBrand = btn.getAttribute('data-brand');
      if (selectedBrand === 'Tất cả') {
        renderProducts(categoryProducts);
      } else {
        const filtered = categoryProducts.filter(p => p.brand === selectedBrand);
        renderProducts(filtered);
      }
    });
  });
}

// Hàm render thẻ Sản phẩm
function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `<p class="status-msg">Không có sản phẩm nào thuộc danh mục/thương hiệu này.</p>`;
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

document.addEventListener('DOMContentLoaded', initCategoryPage);