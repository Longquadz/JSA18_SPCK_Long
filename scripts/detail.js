// 1. Hàm giải mã thông số kỹ thuật chi tiết
function getProductSpecs(product) {
  const title = product.title || "";
  const cat = (product.category || "").toLowerCase();

  if (cat.includes("laptop")) {
    let cpu = "Intel Core i7 / AMD Ryzen 7 (Thế hệ mới)";
    if (/A13|13500|13620|13700/i.test(title)) cpu = "Intel Core i7-13620H / i5-13500H";
    else if (/14700|14900|14100/i.test(title)) cpu = "Intel Core i7-14700HX / i9-14900HX";
    else if (/Ultra/i.test(title)) cpu = "Intel Core Ultra 7 / Ultra 9";
    else if (/M2|M3|M4|M5/i.test(title)) cpu = title.match(/M[2-5](\s\w+)?/i)?.[0] || "Apple Silicon";

    let vga = "Card đồ họa tích hợp";
    if (/VEK|4050|HN329/i.test(title)) vga = "NVIDIA GeForce RTX 4050 6GB";
    else if (/4060|2089|N3206|83DH/i.test(title)) vga = "NVIDIA GeForce RTX 4060 8GB";
    else if (/4070|QR141/i.test(title)) vga = "NVIDIA GeForce RTX 4070 8GB";
    else if (/4080|97T9/i.test(title)) vga = "NVIDIA GeForce RTX 4080 12GB";
    else if (/MacBook/i.test(title)) vga = "Apple GPU tích hợp";

    let ram = /32GB/i.test(title) ? "32 GB DDR5" : /16GB/i.test(title) ? "16 GB DDR5" : "16 GB DDR5 (Chuẩn Gaming)";
    let ssd = /1TB/i.test(title) ? "1 TB SSD NVMe PCIe" : /256GB/i.test(title) ? "256 GB SSD" : "512 GB SSD NVMe PCIe";

    return [
      { label: "Vi xử lý (CPU)", value: cpu },
      { label: "Card đồ họa (VGA)", value: vga },
      { label: "Bộ nhớ RAM", value: ram },
      { label: "Ổ cứng SSD", value: ssd },
      { label: "Màn hình", value: title.includes("16") ? "16.0 inch, 2K+ (2560 x 1600) 165Hz" : "15.6 inch, Full HD 144Hz" },
      { label: "Trọng lượng", value: title.includes("MacBook") ? "1.24 kg" : "2.3 kg" },
      { label: "Hệ điều hành", value: title.includes("MacBook") ? "macOS" : "Windows 11 Home Bản Quyền" }
    ];
  }

  return [
    { label: "Thương hiệu", value: product.brand || "Chính hãng" },
    { label: "Danh mục", value: product.category || "Thiết bị điện tử" },
    { label: "Bảo hành", value: "12 tháng chính hãng" }
  ];
}

// 2. Hàm lấy ID từ URL và render thông tin lên trang
async function loadData() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('detail-title').innerText = 'Không tìm thấy sản phẩm!';
    return;
  }

  let p = null;

  if (typeof localProducts !== 'undefined') {
    p = localProducts.find(item => String(item.id) === String(id));
  }

  if (!p) {
    try {
      const apiId = id.replace('dm-', '');
      const res = await fetch(`https://dummyjson.com/products/${apiId}`);
      if (res.ok) {
        const data = await res.json();
        p = {
          id: id,
          title: data.title,
          price: data.price * 25000,
          thumbnail: data.thumbnail,
          category: data.category,
          brand: data.brand
        };
      }
    } catch (e) {
      console.error("Lỗi tải dữ liệu sản phẩm:", e);
    }
  }

  if (!p) {
    document.getElementById('detail-title').innerText = 'Sản phẩm không tồn tại!';
    return;
  }

  document.getElementById('detail-img').src = p.thumbnail;
  document.getElementById('detail-img').alt = p.title;
  document.getElementById('detail-title').innerText = p.title;
  document.getElementById('detail-price').innerText = Number(p.price).toLocaleString('vi-VN') + 'đ';

  const specs = getProductSpecs(p);
  const specsTableHtml = specs.map(s => `
    <tr>
      <td class="spec-label">${s.label}</td>
      <td class="spec-value">${s.value}</td>
    </tr>
  `).join('');

  document.getElementById('detail-specs').innerHTML = specsTableHtml;

  // --- XỬ LÝ NÚT THÊM VÀO GIỎ HÀNG (ĐÃ ĐỒNG BỘ ĐĂNG NHẬP) ---
  const addCartBtn = document.getElementById('add-cart-btn');
  if (addCartBtn) {
    addCartBtn.onclick = () => {
      // BƯỚC 1: Bắt buộc check trạng thái đăng nhập
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
        return; // Dừng lại, không cho lưu vào giỏ
      }

      // BƯỚC 2: Lưu theo key riêng của user đang đăng nhập
      const cartStorageKey = `cart_${currentUser.username}`;
      let cart = JSON.parse(localStorage.getItem(cartStorageKey)) || [];

      const existingIndex = cart.findIndex(item => String(item.id) === String(p.id));

      if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          id: p.id,
          title: p.title,
          price: p.price,
          thumbnail: p.thumbnail,
          quantity: 1,
          checked: true
        });
      }

      // BƯỚC 3: Ghi vào localStorage
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));

      // BƯỚC 4: Cập nhật badge số lượng trên navbar
      const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
      const cartBadge = document.getElementById('cart-count');
      if (cartBadge) cartBadge.innerText = totalQty;

      // BƯỚC 5: Bật thông báo thành công
      if (typeof showAlert === 'function') {
        showAlert(`Đã thêm "${p.title}" vào giỏ hàng thành công!`, true);
      } else {
        alert(`Đã thêm "${p.title}" vào giỏ hàng thành công!`);
      }
    };
  }
}

window.onload = loadData;