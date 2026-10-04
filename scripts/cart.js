// File: scripts/cart.js

// Biến toàn cục lưu thông tin Voucher đang được áp dụng
let currentVoucher = null;

// Danh sách mã giảm giá hợp lệ của hệ thống
const VOUCHER_LIST = [
  {
    code: 'TECHZONE10',
    type: 'percent', // Giảm theo %
    value: 10,       // 10%
    minOrder: 0,     // Áp dụng mọi đơn
    description: 'Giảm 10% tổng đơn hàng'
  },
  {
    code: 'TIETKIEM50K',
    type: 'fixed',   // Giảm số tiền cố định
    value: 50000,    // Giảm 50.000đ
    minOrder: 200000, // Đơn tối thiểu 200k
    description: 'Giảm 50.000đ cho đơn từ 200k'
  },
  {
    code: 'FREESHIP',
    type: 'fixed',
    value: 30000,    // Giảm 30.000đ
    minOrder: 100000, // Đơn tối thiểu 100k
    description: 'Miễn phí vận chuyển 30.000đ'
  }
];

// 1. Hàm lấy danh sách giỏ hàng từ localStorage của người dùng hiện tại
function getCart() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return [];

  return JSON.parse(localStorage.getItem(`cart_${currentUser.username}`)) || [];
}

// 2. Hàm lưu lại danh sách giỏ hàng vào localStorage
function saveCart(cart) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  localStorage.setItem(`cart_${currentUser.username}`, JSON.stringify(cart));
}

// 3. Hàm tính toán và hiển thị giao diện Giỏ hàng
function renderCart() {
  const emptyCartBox = document.getElementById('empty-cart');
  const cartContentLayout = document.getElementById('cart-content');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalItemsEl = document.getElementById('cart-total-items');
  const cartCountBadge = document.getElementById('cart-count');

  // Lấy thông tin người dùng đang đăng nhập
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // =========================================================
  // TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP
  // =========================================================
  if (!currentUser) {
    if (emptyCartBox) {
      emptyCartBox.style.display = 'block';
      emptyCartBox.innerHTML = `
        <div class="empty-cart-box" style="text-align: center; padding: 40px 20px;">
          <i class="fa-solid fa-user-lock" style="font-size: 50px; color: #d70018; margin-bottom: 15px;"></i>
          <h3 style="margin-bottom: 10px; font-size: 20px;">Bạn chưa đăng nhập</h3>
          <p style="color: #666; margin-bottom: 20px;">Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn!</p>
          <a href="./login.html" class="btn-login-now" style="display: inline-block; background: #d70018; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Đăng nhập ngay</a>
        </div>
      `;
    }
    if (cartContentLayout) cartContentLayout.style.display = 'none';
    if (cartCountBadge) cartCountBadge.innerText = '0';
    return;
  }

  // =========================================================
  // TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP (Lấy dữ liệu giỏ hàng)
  // =========================================================
  const cart = getCart(); // Lấy giỏ hàng từ localStorage

  // Kiểm tra nếu giỏ hàng trống
  if (cart.length === 0) {
    if (emptyCartBox) {
      emptyCartBox.style.display = 'block';
      emptyCartBox.innerHTML = `
        <div class="empty-cart-box" style="text-align: center; padding: 40px 20px;">
          <i class="fa-solid fa-cart-shopping" style="font-size: 50px; color: #d70018; margin-bottom: 15px;"></i>
          <h3 style="margin-bottom: 10px; font-size: 20px;">Giỏ hàng của bạn đang trống</h3>
          <p style="color: #666; margin-bottom: 20px;">Hãy chọn thêm sản phẩm để tiếp tục mua sắm nhé!</p>
          <a href="./index.html" class="btn-continue" style="display: inline-block; background: #d70018; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Khám phá sản phẩm</a>
        </div>
      `;
    }
    if (cartContentLayout) cartContentLayout.style.display = 'none';
    if (cartCountBadge) cartCountBadge.innerText = '0';
    return;
  }

  // =========================================================
  // TRƯỜNG HỢP 3: CÓ SẢN PHẨM -> HIỂN THỊ LAYOUT 2 CỘT
  // =========================================================
  if (emptyCartBox) emptyCartBox.style.display = 'none';
  if (cartContentLayout) cartContentLayout.style.display = 'flex';

  // Tính tổng số lượng item để hiện trên Badge Navbar và tiêu đề
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartTotalItemsEl) cartTotalItemsEl.innerText = totalQuantity;
  if (cartCountBadge) cartCountBadge.innerText = totalQuantity;

  // Render danh sách sản phẩm ra Cột trái
  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = cart.map((item, index) => {
      const oldPrice = Math.round(item.price * 1.1);
      const isChecked = item.checked !== false;

      return `
        <div class="cart-item-card" data-index="${index}">
          <input type="checkbox" class="item-checkbox" ${isChecked ? 'checked' : ''} onchange="toggleItemCheck(${index})">
          
          <img src="${item.thumbnail}" alt="${item.title}" class="item-img">
          
          <div class="item-info">
            <a href="./detail.html?id=${item.id}" class="item-title">${item.title}</a>
            <div class="item-price-box">
              <span class="price-current">${Number(item.price).toLocaleString('vi-VN')}đ</span>
              <span class="price-old">${Number(oldPrice).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <div class="item-actions">
            <button class="btn-delete" onclick="removeItem(${index})" title="Xóa món này">
              <i class="fa-regular fa-trash-can"></i>
            </button>
            
            <div class="qty-control">
              <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
              <input type="text" class="qty-input" value="${item.quantity}" readonly>
              <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Cập nhật Cột phải (Thông tin đơn hàng)
  updateSummary();
}

// 4. Hàm tính toán tiền ở Cột phải
function updateSummary() {
  const cart = getCart();

  // Chỉ tính tiền các sản phẩm ĐƯỢC TÍCH CHỌN
  const selectedItems = cart.filter(item => item.checked !== false);

  const selectedQty = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Giả định tổng giá gốc trước giảm giá
  const originalTotal = selectedItems.reduce((sum, item) => sum + (Math.round(item.price * 1.1) * item.quantity), 0);
  const directDiscount = originalTotal - subtotal;

  // Tính số tiền giảm thêm từ Voucher (nếu có)
  let voucherDiscount = 0;
  if (currentVoucher) {
    if (subtotal >= currentVoucher.minOrder) {
      if (currentVoucher.type === 'percent') {
        voucherDiscount = Math.round((subtotal * currentVoucher.value) / 100);
      } else if (currentVoucher.type === 'fixed') {
        voucherDiscount = currentVoucher.value;
      }
      // Giảm tối đa bằng tiền hàng
      if (voucherDiscount > subtotal) voucherDiscount = subtotal;
    } else {
      // Nếu tổng tiền nhỏ hơn minOrder thì tự hủy voucher
      alert(`Đơn hàng không đủ điều kiện tối thiểu (${Number(currentVoucher.minOrder).toLocaleString('vi-VN')}đ) để dùng mã ${currentVoucher.code}`);
      currentVoucher = null;
    }
  }

  // Tổng tiền thanh toán cuối cùng
  const finalPrice = Math.max(0, subtotal - voucherDiscount);

  const summaryQtyEl = document.getElementById('summary-qty-count');
  const subtotalPriceEl = document.getElementById('subtotal-price');
  const discountPriceEl = document.getElementById('discount-price');
  const finalPriceEl = document.getElementById('final-price');

  if (summaryQtyEl) summaryQtyEl.innerText = selectedQty;
  if (subtotalPriceEl) subtotalPriceEl.innerText = Number(originalTotal).toLocaleString('vi-VN') + 'đ';
  
  // Hiển thị tổng giảm giá (Giảm trực tiếp + Giảm Voucher)
  const totalDiscount = directDiscount + voucherDiscount;
  if (discountPriceEl) discountPriceEl.innerText = '-' + Number(totalDiscount).toLocaleString('vi-VN') + 'đ';
  
  if (finalPriceEl) finalPriceEl.innerText = Number(finalPrice).toLocaleString('vi-VN') + 'đ';

  // Cập nhật giao diện khung Voucher
  renderVoucherUI();

  // Đồng bộ checkbox "Tất cả"
  const selectAllBtn = document.getElementById('select-all-btn');
  if (selectAllBtn && cart.length > 0) {
    selectAllBtn.checked = cart.every(item => item.checked !== false);
  }
}

// 5. Hàm cập nhật trạng thái hiển thị của khung Voucher ở Cột phải
function renderVoucherUI() {
  const voucherBox = document.querySelector('.voucher-box');
  if (!voucherBox) return;

  if (currentVoucher) {
    voucherBox.innerHTML = `
      <div class="voucher-left">
        <i class="fa-solid fa-ticket text-red"></i>
        <span>Mã: <strong>${currentVoucher.code}</strong></span>
      </div>
      <button class="btn-apply-voucher" onclick="removeVoucher()" style="color: #d70018; background: transparent;">Hủy mã</button>
    `;
  } else {
    voucherBox.innerHTML = `
      <div class="voucher-left">
        <i class="fa-solid fa-ticket text-red"></i>
        <span>Áp dụng mã giảm giá</span>
      </div>
      <button class="btn-apply-voucher" onclick="openVoucherModal()">Chọn</button>
    `;
  }
}

// 6. Các hàm quản lý Modal Voucher
function openVoucherModal() {
  const modal = document.getElementById('voucher-modal');
  if (modal) modal.classList.add('active');
}

function closeVoucherModal() {
  const modal = document.getElementById('voucher-modal');
  if (modal) modal.classList.remove('active');
}

function applyVoucherByCode(code) {
  const cart = getCart();
  const selectedItems = cart.filter(item => item.checked !== false);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (selectedItems.length === 0) {
    alert('Vui lòng chọn sản phẩm trước khi áp dụng mã giảm giá!');
    return;
  }

  const cleanCode = code.trim().toUpperCase();
  const foundVoucher = VOUCHER_LIST.find(v => v.code === cleanCode);

  if (!foundVoucher) {
    alert('Mã giảm giá không hợp lệ!');
    return;
  }

  if (subtotal < foundVoucher.minOrder) {
    alert(`Đơn hàng cần tối thiểu ${Number(foundVoucher.minOrder).toLocaleString('vi-VN')}đ để sử dụng mã này!`);
    return;
  }

  currentVoucher = foundVoucher;
  closeVoucherModal();
  updateSummary();
  alert(`Đã áp dụng mã giảm giá: ${currentVoucher.code}`);
}

function removeVoucher() {
  currentVoucher = null;
  updateSummary();
}

// 7. Hàm thay đổi số lượng sản phẩm (+ / -)
function updateQuantity(index, change) {
  let cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    if (confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = 1;
    }
  }

  saveCart(cart);
  renderCart();
}

// 8. Hàm xóa 1 sản phẩm khỏi giỏ
function removeItem(index) {
  let cart = getCart();
  if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }
}

// 9. Hàm chọn / bỏ chọn 1 sản phẩm
function toggleItemCheck(index) {
  let cart = getCart();
  if (cart[index]) {
    cart[index].checked = !cart[index].checked;
    saveCart(cart);
    updateSummary();
  }
}

// 10. Cấu hình Modal xác nhận & Xử lý Thanh Toán
function setupCheckoutModal() {
  const checkoutBtn = document.getElementById('checkout-btn');
  const modal = document.getElementById('checkout-modal');
  const cancelBtn = document.getElementById('cancel-checkout-btn');
  const confirmBtn = document.getElementById('confirm-checkout-btn');

  if (!checkoutBtn || !modal) return;

  checkoutBtn.addEventListener('click', () => {
    const cart = getCart();
    const selectedItems = cart.filter(item => item.checked !== false);

    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!');
      return;
    }

    const msgEl = document.getElementById('modal-msg');
    if (msgEl) {
      msgEl.textContent = `Bạn có chắc chắn muốn thanh toán ${selectedItems.length} sản phẩm đã chọn?`;
    }

    modal.classList.add('active');
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      let cart = getCart();

      const remainingCart = cart.filter(item => item.checked === false);

      saveCart(remainingCart);
      currentVoucher = null; // Reset voucher sau khi mua
      modal.classList.remove('active');

      alert('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.');

      renderCart();
    });
  }
}

// 11. Đăng ký sự kiện Modal Voucher & Load trang
function setupVoucherEvents() {
  const closeBtn = document.getElementById('close-voucher-btn');
  const applyCodeBtn = document.getElementById('apply-code-btn');
  const voucherCodeInput = document.getElementById('voucher-code-input');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeVoucherModal);
  }

  if (applyCodeBtn && voucherCodeInput) {
    applyCodeBtn.addEventListener('click', () => {
      const code = voucherCodeInput.value;
      if (code) {
        applyVoucherByCode(code);
        voucherCodeInput.value = '';
      }
    });
  }

  // Đăng ký sự kiện bấm nút "Dùng" ở từng thẻ voucher trong modal
  document.querySelectorAll('.btn-select-voucher').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.voucher-item');
      if (item) {
        const code = item.getAttribute('data-code');
        if (code) applyVoucherByCode(code);
      }
    });
  });
}

// 12. Khởi tạo sự kiện khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  setupCheckoutModal();
  setupVoucherEvents();

  const selectAllBtn = document.getElementById('select-all-btn');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      let cart = getCart();
      cart.forEach(item => item.checked = isChecked);
      saveCart(cart);
      renderCart();
    });
  }
});