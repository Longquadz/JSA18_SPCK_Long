/**
 * =====================================================================
 * TECHZONE AUTHENTICATION SYSTEM - CLEAN REWRITE (2026)
 * =====================================================================
 */

// 1. CẤU HÌNH CÁC HẰNG SỐ LƯU TRỮ LOCALSTORAGE
const STORAGE = {
  USERS: 'registeredUsers',
  CURRENT: 'currentUser'
};

// =====================================================================
// 2. CÁC HÀM TIỆN ÍCH CƠ BẢN (VALIDATION & NOTIFICATION)
// =====================================================================

/**
 * Kiểm tra định dạng Email hoặc Số điện thoại cực kỳ thoáng và linh hoạt
 */
function isValidInput(value) {
  // Email thoáng: có text, @, text, dấu chấm, text (ví dụ: a@b.c)
  const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+\$/;
  // SĐT Việt Nam: bắt đầu bằng số 0, theo sau đúng 9 chữ số
  const phoneCheck = /^0\d{9}\$/;

  return emailCheck.test(value) || phoneCheck.test(value);
}

/**
 * Hiển thị bảng thông báo tùy chỉnh hoặc fallback về alert chuẩn
 */
function showCustomAlert(message, isSuccess = false, callback = null) {
  const alertBox = document.getElementById('custom-alert');
  const alertMsg = document.getElementById('alert-message');
  const alertIcon = document.getElementById('alert-icon');
  const closeBtn = document.getElementById('alert-close-btn');

  if (!alertBox || !alertMsg || !alertIcon || !closeBtn) {
    alert(message);
    if (callback) callback();
    return;
  }

  alertMsg.innerText = message;
  alertIcon.className = isSuccess ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
  alertBox.classList.remove('hidden');

  closeBtn.onclick = () => {
    alertBox.classList.add('hidden');
    if (callback) callback();
  };
}

// =====================================================================
// 3. XỬ LÝ SỰ KIỆN TRANG WEB (ĐĂNG KÝ & ĐĂNG NHẬP)
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  // --- XỬ LÝ ĐĂNG KÝ ---
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullnameEl = document.getElementById('fullname');
      const usernameEl = document.getElementById('username');
      const passwordEl = document.getElementById('password');

      if (!fullnameEl || !usernameEl || !passwordEl) return;

      const fullname = fullnameEl.value.trim();
      const username = usernameEl.value.trim().toLowerCase();
      const password = passwordEl.value;

      // Validate trống
      if (!fullname || !username || !password) {
        showCustomAlert('Vui lòng nhập đầy đủ thông tin!', false);
        return;
      }

      // Validate định dạng
      if (!isValidInput(username)) {
        showCustomAlert('Email hoặc Số điện thoại không đúng định dạng!', false);
        return;
      }

      // Validate độ dài mật khẩu
      if (password.length < 6) {
        showCustomAlert('Mật khẩu phải có ít nhất 6 ký tự!', false);
        return;
      }

      // Lấy danh sách tài khoản hiện có
      let usersList = [];
      try {
        usersList = JSON.parse(localStorage.getItem(STORAGE.USERS)) || [];
      } catch (err) {
        usersList = [];
      }

      // KIỂM TRA TRÙNG LẶP TRIỆT ĐỂ
      const isDuplicate = usersList.some(user => user.username === username);
      if (isDuplicate) {
        showCustomAlert('❌ Tài khoản (Email/SĐT này) đã được đăng ký trước đó!', false);
        return; // Dừng lại tuyệt đối, không cho lưu đè
      }

      // Thêm tài khoản mới
      const newUser = { fullname, username, password };
      usersList.push(newUser);

      // Lưu ngược lại vào localStorage
      localStorage.setItem(STORAGE.USERS, JSON.stringify(usersList));
      // Xóa sạch các khóa rác cũ nếu có
      localStorage.removeItem('registeredUser');

      showCustomAlert('🎉 Đăng ký tài khoản thành công!', true, () => {
        window.location.href = './login.html';
      });
    });
  }

  // --- XỬ LÝ ĐĂNG NHẬP ---
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const usernameEl = document.getElementById('username');
      const passwordEl = document.getElementById('password');

      if (!usernameEl || !passwordEl) return;

      const username = usernameEl.value.trim().toLowerCase();
      const password = passwordEl.value;

      if (!username || !password) {
        showCustomAlert('Vui lòng điền đầy đủ thông tin!', false);
        return;
      }

      if (!isValidInput(username)) {
        showCustomAlert('Email hoặc Số điện thoại không đúng định dạng!', false);
        return;
      }

      // Lấy danh sách tài khoản
      let usersList = [];
      try {
        usersList = JSON.parse(localStorage.getItem(STORAGE.USERS)) || [];
      } catch (err) {
        usersList = [];
      }

      // Tìm kiếm user khớp thông tin
      const foundUser = usersList.find(user => user.username === username && user.password === password);

      if (!foundUser) {
        const isUserExist = usersList.some(user => user.username === username);
        if (!isUserExist) {
          showCustomAlert('Tài khoản chưa tồn tại! Vui lòng đăng ký trước.', false);
        } else {
          showCustomAlert('Sai mật khẩu! Vui lòng kiểm tra lại.', false);
        }
        return;
      }

      // Đăng nhập thành công -> Lưu session hiện tại
      localStorage.setItem(STORAGE.CURRENT, JSON.stringify(foundUser));
      showCustomAlert(`Chào mừng ${foundUser.fullname} đã quay trở lại!`, true, () => {
        window.location.href = './index.html';
      });
    });
  }

  // Khởi chạy kiểm tra giao diện navbar
  updateNavbarSession();
});

// =====================================================================
// 4. QUẢN LÝ GIAO DIỆN NAVBAR & PROFILE DROPDOWN
// =====================================================================
function updateNavbarSession() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem(STORAGE.CURRENT));
  } catch (err) {
    currentUser = null;
  }

  const loginBtn = navLinks.querySelector('a[href="./login.html"]');

  if (currentUser) {
    if (loginBtn) loginBtn.remove();

    if (!document.getElementById('user-profile-menu')) {
      const profileHTML = `
        <div id="user-profile-menu" class="user-profile-container">
          <button id="user-avatar-btn" class="user-avatar-btn">
            <span class="user-name">${currentUser.fullname}</span>
            <i class="fa-solid fa-circle-user user-icon"></i>
          </button>

          <div id="user-dropdown" class="user-dropdown hidden">
            <div class="dropdown-header">
              <p class="dropdown-name">${currentUser.fullname}</p>
              <p class="dropdown-sub">${currentUser.username}</p>
            </div>
            <hr />
            <button id="logout-btn" class="logout-btn">
              <i class="fa-solid fa-right-from-bracket"></i> Đăng xuất
            </button>
          </div>
        </div>
      `;

      const cartBtn = navLinks.querySelector('.cart-btn');
      if (cartBtn) {
        cartBtn.insertAdjacentHTML('beforebegin', profileHTML);
      } else {
        navLinks.insertAdjacentHTML('beforeend', profileHTML);
      }

      initDropdownEvents();
    }
  }
}

function initDropdownEvents() {
  const avatarBtn = document.getElementById('user-avatar-btn');
  const dropdown = document.getElementById('user-dropdown');
  const logoutBtn = document.getElementById('logout-btn');

  if (avatarBtn && dropdown) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !avatarBtn.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE.CURRENT);
      window.location.reload();
    });
  }
}