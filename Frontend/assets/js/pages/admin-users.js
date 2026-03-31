/**
 * pages/admin-users.js — Quản lý khách hàng (Admin)
 * Dùng GET /api/users/search?keyword=&role= từ Backend
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (!isLoggedIn() || !Session.getUser()?.isAdmin) {
    alert('Bạn không có quyền truy cập!');
    window.location.href = 'index.html';
    return;
  }

  await loadUsers();

  document.getElementById('searchInput')?.addEventListener('input',  debounce(loadUsers, 300));
  document.getElementById('roleFilter')?.addEventListener('change',  loadUsers);
});

let allUsers = [];
let pendingDeleteEmail = null;

/* ─── Load / Search users ─── */
async function loadUsers() {
  const keyword = document.getElementById('searchInput')?.value.trim() || '';
  const role    = document.getElementById('roleFilter')?.value || 'all';

  const tbody  = document.getElementById('usersTableBody');
  const emptyEl= document.getElementById('emptyUsers');
  if (tbody) tbody.innerHTML = `
    <tr><td colspan="5" class="py-12 text-center">
      <div class="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </td></tr>`;

  try {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (role !== 'all') params.role = role;

    const res  = await UserAPI.search(params);
    allUsers   = res.data || [];
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">${err.message}</td></tr>`;
    return;
  }

  /* Stats */
  setEl('totalUsers',     allUsers.length);
  setEl('totalCustomers', allUsers.filter(u => u.VaiTro !== 'Admin').length);
  setEl('totalAdmins',    allUsers.filter(u => u.VaiTro === 'Admin').length);

  if (allUsers.length === 0) {
    if (tbody) tbody.innerHTML = '';
    emptyEl?.classList.remove('hidden');
    return;
  }
  emptyEl?.classList.add('hidden');

  tbody.innerHTML = allUsers.map(user => {
    const isAdmin     = user.VaiTro === 'Admin';
    const isProtected = user.Email === 'admin@gmail.com';

    const roleBadge = isAdmin
      ? '<span class="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold border border-red-100">Admin</span>'
      : '<span class="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-100">Khách hàng</span>';

    const actionBtns = isProtected
      ? `<span class="text-gray-400 text-xs italic">Không thể xóa</span>`
      : `<div class="flex items-center justify-end gap-1">
           <button onclick="openDetailModal('${user.Email}')"
                   class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
             <i data-lucide="eye" class="w-4 h-4"></i>
           </button>
           <button onclick="openDeleteModal('${user.Email}')"
                   class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa tài khoản">
             <i data-lucide="trash-2" class="w-4 h-4"></i>
           </button>
         </div>`;

    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="py-4 px-6">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              ${(user.HoTen || 'U').charAt(0).toUpperCase()}
            </div>
            <span class="font-semibold text-gray-900 text-sm">${user.HoTen || '—'}</span>
          </div>
        </td>
        <td class="py-4 px-6 text-gray-600 text-sm">${user.Email}</td>
        <td class="py-4 px-6">${roleBadge}</td>
        <td class="py-4 px-6 text-center">
          ${!isAdmin
            ? `<button onclick="openDetailModal('${user.Email}')"
                       class="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                 <i data-lucide="package" class="w-4 h-4"></i>
                 ${user.SoDonHang || 0}
               </button>`
            : `<span class="text-gray-400 text-sm">—</span>`}
        </td>
        <td class="py-4 px-6 text-right">${actionBtns}</td>
      </tr>`;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ─── Detail modal ─── */
window.openDetailModal = async function (email) {
  const user = allUsers.find(u => u.Email === email);
  if (!user) return;

  setEl('modalAvatar', (user.HoTen || 'U').charAt(0).toUpperCase());
  setEl('modalName',   user.HoTen || '—');
  setEl('modalEmail',  user.Email);

  const badge = document.getElementById('modalBadge');
  if (badge) badge.innerHTML = user.VaiTro === 'Admin'
    ? '<span class="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold border border-red-100">Quản trị viên</span>'
    : '<span class="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-100">Khách hàng</span>';

  /* Load orders for this user by fetching all orders and filtering
     (or you could add a backend endpoint; this re-uses existing API) */
  setEl('modalTotalOrders',     '...');
  setEl('modalCompletedOrders', '...');
  setEl('modalTotalSpent',      '...');
  document.getElementById('modalOrdersList')?.classList.add('hidden');
  document.getElementById('modalNoOrders')?.classList.add('hidden');

  document.getElementById('userDetailModal')?.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();

  try {
    // Lấy tất cả đơn hàng (Admin endpoint) rồi lọc theo email
    const res    = await OrderAPI.getAll();
    const orders = (res.data || []).filter(o => o.Email === email);
    const completed = orders.filter(o => o.TrangThai === 'completed');
    const totalSpent = completed.reduce((s, o) => s + Number(o.TongTien), 0);

    setEl('modalTotalOrders',     orders.length);
    setEl('modalCompletedOrders', completed.length);
    setEl('modalTotalSpent',      totalSpent > 0 ? (totalSpent / 1_000_000).toFixed(1) + 'M₫' : '0₫');

    const ordersListEl = document.getElementById('modalOrdersList');
    const noOrdersEl   = document.getElementById('modalNoOrders');

    if (orders.length === 0) {
      noOrdersEl?.classList.remove('hidden');
    } else {
      ordersListEl?.classList.remove('hidden');
      const statusConfig = {
        pending:    { label: 'Chờ xác nhận', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        processing: { label: 'Đang xử lý',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
        completed:  { label: 'Hoàn thành',    cls: 'bg-green-50 text-green-700 border-green-200' },
        cancelled:  { label: 'Đã hủy',        cls: 'bg-red-50 text-red-700 border-red-200' },
      };
      if (ordersListEl) {
        ordersListEl.innerHTML = orders.map(o => {
          const cfg = statusConfig[o.TrangThai] || statusConfig.pending;
          return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 text-sm">#${o.MaDH}</p>
                <p class="text-gray-500 text-xs mt-0.5">${new Date(o.NgayDat).toLocaleDateString('vi-VN')} · ${(o.items || []).length} sản phẩm</p>
              </div>
              <div class="flex items-center gap-3 ml-3">
                <span class="font-bold text-amber-600 text-sm whitespace-nowrap">${Number(o.TongTien).toLocaleString('vi-VN')}₫</span>
                <span class="px-2 py-0.5 text-xs font-semibold rounded-full border ${cfg.cls} whitespace-nowrap">${cfg.label}</span>
              </div>
            </div>`;
        }).join('');
      }
    }
  } catch (err) {
    console.error('load user orders error', err);
  }
};

window.closeDetailModal = function () {
  document.getElementById('userDetailModal')?.classList.add('hidden');
};

/* ─── Delete modal ─── */
window.openDeleteModal = function (email) {
  pendingDeleteEmail = email;
  setEl('deleteTargetEmail', email);
  document.getElementById('deleteConfirmModal')?.classList.remove('hidden');
};

window.closeDeleteModal = function () {
  pendingDeleteEmail = null;
  document.getElementById('deleteConfirmModal')?.classList.add('hidden');
};

document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
  if (!pendingDeleteEmail) return;
  try {
    await UserAPI.remove(pendingDeleteEmail);
    showToast('Đã xóa tài khoản thành công');
    closeDeleteModal();
    await loadUsers();
  } catch (err) {
    showToast(err.message || 'Xóa thất bại', 'error');
    closeDeleteModal();
  }
});

/* ─── Close on backdrop click ─── */
document.getElementById('userDetailModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeDetailModal();
});
document.getElementById('deleteConfirmModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeDeleteModal();
});

/* ─── Helpers ─── */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}