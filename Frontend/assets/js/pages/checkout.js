/**
 * pages/checkout.js — Thanh toán từ giỏ hàng
 *
 * FIX: cartItems được khai báo ở module scope để paymentForm.submit
 *      có thể truy cập đúng dù async load.
 *      Thêm retry + fallback rõ ràng khi API trả về mảng rỗng.
 */

// ── Module-scope để paymentForm submit closure luôn truy cập được ──
let _cartItems   = [];
let _shippingInfo = {};

document.addEventListener('DOMContentLoaded', async () => {
  if (!isLoggedIn()) { window.location.href = 'index.html'; return; }

  /* ─── Load cart từ API ─── */
  await loadCartAndRender();

  /* ─── Bind form events ─── */
  bindForms();

  if (typeof lucide !== 'undefined') lucide.createIcons();
});

/* ════════════════════════════════════════
   LOAD CART
════════════════════════════════════════ */
async function loadCartAndRender() {
  try {
    const res = await CartAPI.get();
    console.log("Toàn bộ phản hồi từ API:", res);
    _cartItems = res.data || [];

    // Log để debug nếu cần
    console.log('[checkout] cartItems từ API:', _cartItems);
  } catch (err) {
    console.error('[checkout] CartAPI.get() lỗi:', err);
    showToast('Không thể tải giỏ hàng: ' + (err.message || 'Lỗi mạng'), 'error');
    setTimeout(() => { window.location.href = 'cart.html'; }, 1500);
    return;
  }

  if (_cartItems.length === 0) {
    showToast('Giỏ hàng của bạn đang trống!', 'error');
    setTimeout(() => { window.location.href = 'products.html'; }, 1500);
    return;
  }

  renderOrderSummary();
}

/* ════════════════════════════════════════
   RENDER ORDER SUMMARY
════════════════════════════════════════ */
function renderOrderSummary() {
  const listEl     = document.getElementById('checkoutItemsList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const shippingEl = document.getElementById('checkoutShipping');
  const totalEl    = document.getElementById('checkoutTotal');

  let subtotal = 0;

  if (listEl) {
    listEl.innerHTML = _cartItems.map(item => {
      // Backend trả về SoLuong (PascalCase) — an toàn hơn ta normalize cả hai
      const qty   = item.SoLuong ?? item.soLuong ?? 1;
      const price = Number(item.GiaBan ?? item.giaBan ?? 0);
      subtotal   += price * qty;

      return `
        <div class="flex gap-3">
          <div class="relative">
            <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
              <img src="${item.HinhAnh || item.hinhAnh || ''}"
                   class="w-full h-full object-cover"
                   onerror="this.src='https://placehold.co/64?text=NT'">
            </div>
            <span class="absolute -top-2 -right-2 w-6 h-6 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center">
              ${qty}
            </span>
          </div>
          <div class="flex-1">
            <p class="font-medium text-sm text-gray-900">${item.TenSP || item.tenSP || ''}</p>
            <p class="text-sm text-amber-600 font-semibold">${price.toLocaleString('vi-VN')}₫</p>
          </div>
        </div>`;
    }).join('');
  }

  const shipping = subtotal >= 5_000_000 ? 0 : 200_000;
  const total    = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('vi-VN') + '₫';
  if (shippingEl) {
    shippingEl.innerHTML = shipping === 0
      ? '<span class="text-green-600 font-semibold">Miễn phí</span>'
      : shipping.toLocaleString('vi-VN') + '₫';
  }
  if (totalEl) totalEl.textContent = total.toLocaleString('vi-VN') + '₫';
}

/* ════════════════════════════════════════
   BIND FORM EVENTS
════════════════════════════════════════ */
function bindForms() {
  const infoForm    = document.getElementById('infoForm');
  const paymentForm = document.getElementById('paymentForm');
  const step1Ind    = document.getElementById('step1Indicator');
  const step2Ind    = document.getElementById('step2Indicator');
  const step2Text   = document.getElementById('step2Text');

  /* ── Step 1: Thu thập thông tin giao hàng ── */
  infoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = infoForm.querySelectorAll('input, textarea');
    _shippingInfo = {
      HoTen:    inputs[0]?.value.trim() || '',
      SDT:      inputs[1]?.value.trim() || '',
      Email:    inputs[2]?.value.trim() || '',
      DiaChi:   inputs[3]?.value.trim() || '',
      City:     inputs[4]?.value.trim() || '',
      District: inputs[5]?.value.trim() || '',
      Ward:     inputs[6]?.value.trim() || '',
    };

    // Chuyển sang step 2
    infoForm.classList.add('hidden');
    paymentForm.classList.remove('hidden');

    step1Ind.innerHTML = '<i data-lucide="check-circle" class="w-6 h-6"></i>';
    step1Ind.classList.replace('bg-amber-600', 'bg-green-600');
    step2Ind.classList.replace('bg-gray-300', 'bg-amber-600');
    step2Ind.classList.replace('text-gray-600', 'text-white');
    step2Text?.classList.replace('text-gray-500', 'font-semibold');
    lucide?.createIcons();
  });

  /* ── Back to step 1 ── */
  document.getElementById('backToInfoBtn')?.addEventListener('click', () => {
    paymentForm.classList.add('hidden');
    infoForm.classList.remove('hidden');

    step1Ind.innerHTML = '1';
    step1Ind.classList.replace('bg-green-600', 'bg-amber-600');
    step2Ind.classList.replace('bg-amber-600', 'bg-gray-300');
    step2Ind.classList.replace('text-white', 'text-gray-600');
    step2Text?.classList.replace('font-semibold', 'text-gray-500');
  });

  /* ── Step 2: Đặt hàng ── */
  paymentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Guard: nếu cartItems bị mất (edge case) thì fetch lại
    if (_cartItems.length === 0) {
      showToast('Giỏ hàng trống, đang tải lại...', 'error');
      await loadCartAndRender();
      if (_cartItems.length === 0) return;
    }

    const submitBtn = paymentForm.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang xử lý...'; }

    const diaChiGH = [
      _shippingInfo.DiaChi,
      _shippingInfo.Ward,
      _shippingInfo.District,
      _shippingInfo.City,
    ].filter(Boolean).join(', ');

    const payload = {
      DiaChiGH: diaChiGH,
      SDT:      _shippingInfo.SDT,
      cartItems: _cartItems.map(i => ({
        MaSP:    i.MaSP    ?? i.maSP,
        SoLuong: i.SoLuong ?? i.soLuong ?? 1,
        GiaBan:  i.GiaBan  ?? i.giaBan  ?? 0,
      })),
    };

    console.log('[checkout] payload gửi lên:', payload);

    try {
      const res = await OrderAPI.create(payload);

      // Ẩn form, hiện success
      document.getElementById('checkoutFlow')?.classList.add('hidden');
      const successEl = document.getElementById('successFlow');
      if (successEl) { successEl.classList.remove('hidden'); successEl.classList.add('flex'); }

      const orderIdEl = document.getElementById('fullOrderId');
      if (orderIdEl) orderIdEl.textContent = '#' + res.data.MaDH;

      // Reset module vars
      _cartItems    = [];
      _shippingInfo = {};

      updateHeaderCartCount();
    } catch (err) {
      console.error('[checkout] OrderAPI.create lỗi:', err);
      showToast(err.message || 'Đặt hàng thất bại, vui lòng thử lại', 'error');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Hoàn tất đơn hàng'; }
    }
  });
}