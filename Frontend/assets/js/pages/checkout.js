/**
 * pages/checkout.js — Thanh toán từ giỏ hàng
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) { window.location.href = 'index.html'; return; }

  /* ─── Load cart ─── */
  let cartItems = [];
  try {
    const res = await CartAPI.get();
    cartItems = res.data || [];
  } catch (err) {
    alert('Không thể tải giỏ hàng: ' + err.message);
    window.location.href = 'cart.html';
    return;
  }

  if (cartItems.length === 0) {
    alert('Giỏ hàng của bạn đang trống!');
    window.location.href = 'products.html';
    return;
  }

  /* ─── Render order summary ─── */
  const listEl     = document.getElementById('checkoutItemsList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const shippingEl = document.getElementById('checkoutShipping');
  const totalEl    = document.getElementById('checkoutTotal');

  let subtotal = 0;
  if (listEl) {
    listEl.innerHTML = cartItems.map(item => {
      subtotal += Number(item.GiaBan) * item.SoLuong;
      
      // ĐÃ SỬA: Thêm logic nối link Backend cho HinhAnh
      const imageUrl = (item.HinhAnh && item.HinhAnh.startsWith('http')) 
        ? item.HinhAnh 
        : (item.HinhAnh?.startsWith('/') ? `http://localhost:5000${item.HinhAnh}` : `http://localhost:5000/${item.HinhAnh}`);

      return `
        <div class="flex gap-3 mb-4">
          <div class="relative">
            <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
              <img src="${imageUrl}" class="w-full h-full object-cover"
                   onerror="this.src='https://placehold.co/64?text=NT'">
            </div>
            <span class="absolute -top-2 -right-2 w-6 h-6 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center">
              ${item.SoLuong}
            </span>
          </div>
          <div class="flex-1">
            <p class="font-medium text-sm text-gray-900">${item.TenSP}</p>
            <p class="text-sm text-amber-600 font-semibold">${Number(item.GiaBan).toLocaleString('vi-VN')}₫</p>
          </div>
        </div>`;
    }).join('');
  }

  const shipping = subtotal >= 5_000_000 ? 0 : 200_000;
  const total    = subtotal + shipping;
  if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('vi-VN') + '₫';
  if (shippingEl) shippingEl.innerHTML = shipping === 0
    ? '<span class="text-green-600 font-semibold">Miễn phí</span>'
    : shipping.toLocaleString('vi-VN') + '₫';
  if (totalEl) totalEl.textContent = total.toLocaleString('vi-VN') + '₫';

  /* ─── Step 1: Shipping info ─── */
  const infoForm    = document.getElementById('infoForm');
  const paymentForm = document.getElementById('paymentForm');
  const step1Ind    = document.getElementById('step1Indicator');
  const step2Ind    = document.getElementById('step2Indicator');
  const step2Text   = document.getElementById('step2Text');

  let shippingInfo = {};

  infoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = infoForm.querySelectorAll('input, textarea');
    shippingInfo = {
      HoTen:   inputs[0]?.value || '',
      SDT:     inputs[1]?.value || '',
      Email:   inputs[2]?.value || '',
      DiaChi:  inputs[3]?.value || '',
      City:    inputs[4]?.value || '',
      District:inputs[5]?.value || '',
      Ward:    inputs[6]?.value || '',
    };

    infoForm.classList.add('hidden');
    paymentForm.classList.remove('hidden');
    step1Ind.innerHTML = '<i data-lucide="check-circle" class="w-6 h-6"></i>';
    step1Ind.classList.replace('bg-amber-600', 'bg-green-600');
    step2Ind.classList.replace('bg-gray-300', 'bg-amber-600');
    step2Ind.classList.replace('text-gray-600', 'text-white');
    step2Text.classList.replace('text-gray-500', 'font-semibold');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });

  document.getElementById('backToInfoBtn')?.addEventListener('click', () => {
    paymentForm.classList.add('hidden');
    infoForm.classList.remove('hidden');
    step1Ind.innerHTML = '1';
    step1Ind.classList.replace('bg-green-600', 'bg-amber-600');
    step2Ind.classList.replace('bg-amber-600', 'bg-gray-300');
    step2Ind.classList.replace('text-white', 'text-gray-600');
    step2Text.classList.replace('font-semibold', 'text-gray-500');
  });

  /* ─── Step 2: Submit order ─── */
  paymentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = paymentForm.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang xử lý...'; }

    const diaChiGH = `${shippingInfo.DiaChi}, ${shippingInfo.Ward}, ${shippingInfo.District}, ${shippingInfo.City}`;

    const payload = {
      DiaChiGH: diaChiGH,
      SDT: shippingInfo.SDT,
      cartItems: cartItems.map(i => ({
        MaSP:   i.MaSP,
        SoLuong: i.SoLuong,
        GiaBan: i.GiaBan,
      })),
    };

    try {
      const res = await OrderAPI.create(payload);
      /* Show success */
      document.getElementById('checkoutFlow')?.classList.add('hidden');
      const successEl = document.getElementById('successFlow');
      if (successEl) {
        successEl.classList.remove('hidden');
        successEl.classList.add('flex');
      }
      const orderIdEl = document.getElementById('fullOrderId');
      if (orderIdEl) orderIdEl.textContent = '#' + res.data.MaDH;
      
      if (typeof updateHeaderCartCount === 'function') updateHeaderCartCount();
      
    } catch (err) {
      if (typeof showToast === 'function') showToast(err.message || 'Đặt hàng thất bại, vui lòng thử lại', 'error');
      else alert(err.message || 'Đặt hàng thất bại, vui lòng thử lại');
      
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Hoàn tất đơn hàng'; }
    }
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
});