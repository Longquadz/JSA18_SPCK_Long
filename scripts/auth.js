// =========================================================
// 1. BỘ HÀM BỔ TRỢ (VALIDATE & CUSTOM ALERT)
// =========================================================

// Hàm kiểm tra định dạng Email hoặc Số điện thoại Việt Nam (Đã fix lỗi biểu thức Regex)
function isValidUsername(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+\$/;
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\$/;
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
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Xử lý Đăng ký (Hỗ trợ đa tài khoản & Chống trùng lặp tuyệt đối)
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fullname = document.getElementById('fullname').value.trim();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (!fullname || !username || !password) {
        showAlert('Vui lòng nhập đầy đủ thông tin!', false);
        return;
      }

      if (!isValidUsername(username)) {
        showAlert('Email hoặc Số điện thoại không đúng định dạng!', false);
        return;
      }

      if (password.length < 6) {
        showAlert('Mật khẩu phải có ít nhất 6 ký tự!', false);
        return;
      }

      // 1. Lấy danh sách tài khoản từ mảng 'registeredUsers'
      let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

      // [Phòng hờ dữ liệu cũ đơn lẻ]
      const oldSingleUser = JSON.parse(localStorage.getItem('registeredUser'));
      if (oldSingleUser && !users.some(u => u.username === oldSingleUser.username)) {
        users.push(oldSingleUser);
      }

      // 2. Kiểm tra xem Email/SĐT này đã tồn tại hay chưa
      const isExist = users.some(user => user.username.toLowerCase() === username.toLowerCase());
      if (isExist) {
        showAlert('❌ Tài khoản (Email/SĐT này) đã được đăng ký trước đó!', false);
        return;
      }

      // 3. Thêm user mới vào mảng
      const newUser = { fullname, username, password };
      users.push(newUser);

      // 4. Lưu ngược lại vào localStorage và dọn dẹp khóa cũ
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      localStorage.removeItem('registeredUser');

      showAlert('Đăng ký tài khoản thành công!', true, () => {
        window.location.href = './login.html';
      });
    });
  }

  // Xử lý Đăng nhập
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const usernameInput = document.getElementById('username').value.trim();
      const passwordInput = document.getElementById('password').value;

      if (!usernameInput || !passwordInput) {
        showAlert('Vui lòng điền đầy đủ thông tin!', false);
        return;
      }

      if (!isValidUsername(usernameInput)) {
        showAlert('Email hoặc Số điện thoại không đúng định dạng!', false);
        return;
      }

      // Lấy danh sách tất cả tài khoản đã đăng ký
      let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

      if (users.length === 0) {
        const oldSingleUser = JSON.parse(localStorage.getItem('registeredUser'));
        if (oldSingleUser) users.push(oldSingleUser);
      }

      // Tìm xem có user nào khớp thông tin không
      const matchedUser = users.find(user => user.username.toLowerCase() === usernameInput.toLowerCase() && user.password === passwordInput);

      if (!matchedUser) {
        const isUserExist = users.some(user => user.username.toLowerCase() === usernameInput.toLowerCase());
        if (!isUserExist) {
          showAlert('Tài khoản chưa tồn tại! Vui lòng đăng ký trước.', false);
        } else {
          showAlert('Sai số điện thoại/email hoặc mật khẩu!', false);
        }
        return;
      }

      // Đăng nhập thành công
      localStorage.setItem('currentUser', JSON.stringify(matchedUser));
      showAlert(`Chào mừng ${matchedUser.fullname} đã quay trở lại!`, true, () => {
        window.location.href = './index.html';
      });
    });
  }

  // Chạy luôn hàm kiểm tra trạng thái Navbar
  checkLoginStatus();
});


// =========================================================
// 3. HÀM KIỂM TRA VÀ CẬP NHẬT GIAO DIỆN NAVBAR
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