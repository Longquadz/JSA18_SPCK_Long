// =========================================================
// 1. BỘ HÀM BỔ TRỢ (VALIDATE & CUSTOM ALERT)
// =========================================================

// Hàm kiểm tra định dạng Email hoặc Số điện thoại Việt Nam
function isValidUsername(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return emailRegex.test(input) || phoneRegex.test(input);
}

// Hàm hiển thị Message Box Custom
function showAlert(message, isSuccess = false, callback = null) {
  const alertBox = document.getElementById('custom-alert');
  const alertMsg = document.getElementById('alert-message');
  const alertIcon = document.getElementById('alert-icon');
  const closeBtn = document.getElementById('alert-close-btn');

  if (!alertBox) {
    alert(message);
    if (callback) callback();
    return;
  }

  alertMsg.innerText = message;
  
  if (isSuccess) {
    alertIcon.className = 'fa-solid fa-circle-check';
  } else {
    alertIcon.className = 'fa-solid fa-circle-xmark';
  }

  alertBox.classList.remove('hidden');

  closeBtn.onclick = () => {
    alertBox.classList.add('hidden');
    if (callback) callback();
  };
}


// =========================================================
// 2. XỬ LÝ FORM ĐĂNG KÝ VÀ ĐĂNG NHẬP (TRANG LOGIN/REGISTER)
// =========================================================
window.onload = () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Xử lý Đăng ký
  if (registerForm) {
    registerForm.onsubmit = (e) => {
      e.preventDefault();
      
      const fullname = document.getElementById('fullname').value.trim();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (!fullname || !username || !password) {
        showAlert('Vui lòng nhập đầy đủ thông tin!', false);
        return false;
      }

      if (!isValidUsername(username)) {
        showAlert('Email hoặc Số điện thoại không đúng định dạng!', false);
        return false;
      }

      if (password.length < 6) {
        showAlert('Mật khẩu phải có ít nhất 6 ký tự!', false);
        return false;
      }

      const user = { fullname, username, password };
      localStorage.setItem('registeredUser', JSON.stringify(user));

      showAlert('Đăng ký tài khoản thành công!', true, () => {
        window.location.href = './login.html';
      });

      return false;
    };
  }

  // Xử lý Đăng nhập
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();

      const usernameInput = document.getElementById('username').value.trim();
      const passwordInput = document.getElementById('password').value;

      if (!usernameInput || !passwordInput) {
        showAlert('Vui lòng điền đầy đủ thông tin!', false);
        return false;
      }

      if (!isValidUsername(usernameInput)) {
        showAlert('Email hoặc Số điện thoại không đúng định dạng!', false);
        return false;
      }

      const savedUser = JSON.parse(localStorage.getItem('registeredUser'));

      if (!savedUser) {
        showAlert('Tài khoản chưa tồn tại! Vui lòng đăng ký trước.', false);
        return false;
      }

      if (savedUser.username !== usernameInput || savedUser.password !== passwordInput) {
        showAlert('Sai số điện thoại/email hoặc mật khẩu!', false);
        return false;
      }

      localStorage.setItem('currentUser', JSON.stringify(savedUser));
      showAlert(`Chào mừng ${savedUser.fullname} đã quay trở lại!`, true, () => {
        window.location.href = './index.html';
      });

      return false;
    };
  }
};


// =========================================================
// 3. HÀM KIỂM TRA VÀ CẬP NHẬT GIAO DIỆN NAVBAR (ĐỐI VỚI DÙNG CHUNG)
// =========================================================
function checkLoginStatus() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const loginBtn = navLinks.querySelector('a[href="./login.html"]');

  if (currentUser) {
    if (loginBtn) {
      loginBtn.remove();
    }

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

      setupProfileEvents();
    }
  }
}

function setupProfileEvents() {
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
      localStorage.removeItem('currentUser');
      window.location.reload();
    });
  }
}

// Tự động chạy kiểm tra trạng thái ngay khi trang tải xong
document.addEventListener('DOMContentLoaded', checkLoginStatus);