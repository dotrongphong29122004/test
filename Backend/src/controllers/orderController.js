const { sql, query, beginTransaction } = require('../../config/db');

const createOrder = async (req, res, next) => {
  const transaction = await beginTransaction();
  try {
    const { DiaChiGH, SDT, cartItems } = req.body;
    const { MaND } = req.user;
    if (!cartItems?.length) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }
    const tongTien = cartItems.reduce((sum, i) => sum + i.GiaBan * i.SoLuong, 0);

    // 1. Tạo đơn hàng
    const r1 = transaction.request();
    r1.input('maND', sql.Int, MaND);
    r1.input('tongTien', sql.Decimal(18,2), tongTien);
    r1.input('diaChiGH', sql.NVarChar(500), `${DiaChiGH} | SDT: ${SDT}`);
    r1.input('trangThai', sql.NVarChar(50), 'pending');
    const orderRes = await r1.query(
      `INSERT INTO DonHang (MaND,NgayDat,TongTien,TrangThai,DiaChiGH)
       OUTPUT INSERTED.MaDH VALUES (@maND,GETDATE(),@tongTien,@trangThai,@diaChiGH)`
    );
    const MaDH = orderRes.recordset[0].MaDH;

    // 2. Chi tiết + trừ tồn kho
    for (const item of cartItems) {
      const r2 = transaction.request();
      r2.input('maDH', sql.Int, MaDH); r2.input('maSP', sql.Int, item.MaSP);
      r2.input('soLuong', sql.Int, item.SoLuong); r2.input('donGia', sql.Decimal(18,2), item.GiaBan);
      await r2.query(`INSERT INTO ChiTietDonHang (MaDH,MaSP,SoLuong,DonGia) VALUES (@maDH,@maSP,@soLuong,@donGia)`);
      const r3 = transaction.request();
      r3.input('sl', sql.Int, item.SoLuong); r3.input('maSP', sql.Int, item.MaSP);
      await r3.query(`UPDATE SanPham SET SLTon=SLTon-@sl WHERE MaSP=@maSP AND SLTon>=@sl`);
    }

    // 3. Xóa giỏ hàng
    const r4 = transaction.request();
    r4.input('maND', sql.Int, MaND);
    await r4.query('DELETE FROM GioHang WHERE MaND=@maND');

    await transaction.commit();
    res.status(201).json({ success: true, message: 'Đặt hàng thành công', data: { MaDH, TongTien: tongTien } });
  } catch (err) { await transaction.rollback(); next(err); }
};

const getMyOrders = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT dh.MaDH,dh.NgayDat,dh.TongTien,dh.TrangThai,dh.DiaChiGH,
              ct.MaSP,sp.TenSP,sp.HinhAnh,ct.SoLuong,ct.DonGia
       FROM DonHang dh JOIN ChiTietDonHang ct ON dh.MaDH=ct.MaDH
       JOIN SanPham sp ON ct.MaSP=sp.MaSP WHERE dh.MaND=@maND ORDER BY dh.NgayDat DESC`,
      { maND: { type: sql.Int, value: req.user.MaND } }
    );
    const map = {};
    result.recordset.forEach(r => {
      if (!map[r.MaDH]) map[r.MaDH] = { MaDH:r.MaDH,NgayDat:r.NgayDat,TongTien:r.TongTien,TrangThai:r.TrangThai,DiaChiGH:r.DiaChiGH,items:[] };
      map[r.MaDH].items.push({ MaSP:r.MaSP,TenSP:r.TenSP,HinhAnh:r.HinhAnh,SoLuong:r.SoLuong,DonGia:r.DonGia });
    });
    res.json({ success: true, data: Object.values(map) });
  } catch (err) { next(err); }
};

const getAllOrders = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT dh.MaDH,dh.NgayDat,dh.TongTien,dh.TrangThai,dh.DiaChiGH,
              nd.HoTen AS TenKH,nd.Email,ct.MaSP,sp.TenSP,sp.HinhAnh,ct.SoLuong,ct.DonGia
       FROM DonHang dh JOIN NguoiDung nd ON dh.MaND=nd.MaND
       JOIN ChiTietDonHang ct ON dh.MaDH=ct.MaDH JOIN SanPham sp ON ct.MaSP=sp.MaSP
       ORDER BY dh.NgayDat DESC`
    );
    const map = {};
    result.recordset.forEach(r => {
      if (!map[r.MaDH]) map[r.MaDH] = { MaDH:r.MaDH,NgayDat:r.NgayDat,TongTien:r.TongTien,TrangThai:r.TrangThai,DiaChiGH:r.DiaChiGH,TenKH:r.TenKH,Email:r.Email,items:[] };
      map[r.MaDH].items.push({ MaSP:r.MaSP,TenSP:r.TenSP,HinhAnh:r.HinhAnh,SoLuong:r.SoLuong,DonGia:r.DonGia });
    });
    res.json({ success: true, data: Object.values(map) });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const valid = ['pending','processing','completed','cancelled'];
    if (!valid.includes(req.body.status))
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    await query('UPDATE DonHang SET TrangThai=@status WHERE MaDH=@maDH',
      { status:{type:sql.NVarChar(50),value:req.body.status}, maDH:{type:sql.Int,value:parseInt(req.params.id)} });
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        COUNT(*)                                          AS TongDonHang,
        SUM(CASE WHEN TrangThai = 'pending'    THEN 1 ELSE 0 END) AS ChoXacNhan,
        SUM(CASE WHEN TrangThai = 'processing' THEN 1 ELSE 0 END) AS DangXuLy,
        SUM(CASE WHEN TrangThai = 'completed'  THEN 1 ELSE 0 END) AS HoanThanh,
        SUM(CASE WHEN TrangThai = 'cancelled'  THEN 1 ELSE 0 END) AS DaHuy,
        ISNULL(SUM(CASE WHEN TrangThai = 'completed' THEN TongTien ELSE 0 END), 0) AS DoanhThu
      FROM DonHang
    `);

    const row = result.recordset[0];
    res.json({
      success: true,
      data: {
        TongDonHang: row.TongDonHang,
        ChoXacNhan:  row.ChoXacNhan,
        DangXuLy:    row.DangXuLy,
        HoanThanh:   row.HoanThanh,
        DaHuy:       row.DaHuy,
        DoanhThu:    row.DoanhThu,
      },
    });
  } catch (err) { next(err); }
};

const getOrderById = async (req, res, next) => {
  try {
    const { MaND, MaVaiTro } = req.user;
    const maDH = parseInt(req.params.id);

    const result = await query(
      `SELECT dh.MaDH, dh.NgayDat, dh.TongTien, dh.TrangThai, dh.DiaChiGH,
              nd.HoTen AS TenKH, nd.Email,
              ct.MaSP, sp.TenSP, sp.HinhAnh, ct.SoLuong, ct.DonGia
       FROM DonHang dh
       JOIN NguoiDung nd ON dh.MaND = nd.MaND
       JOIN ChiTietDonHang ct ON dh.MaDH = ct.MaDH
       JOIN SanPham sp ON ct.MaSP = sp.MaSP
       WHERE dh.MaDH = @maDH
       AND (@vaiTro = 1 OR dh.MaND = @maND)`,
      {
        maDH:    { type: sql.Int, value: maDH },
        maND:    { type: sql.Int, value: MaND },
        vaiTro:  { type: sql.Int, value: MaVaiTro },
      }
    );

    if (!result.recordset.length)
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

    const row = result.recordset[0];
    const order = {
      MaDH:      row.MaDH,
      NgayDat:   row.NgayDat,
      TongTien:  row.TongTien,
      TrangThai: row.TrangThai,
      DiaChiGH:  row.DiaChiGH,
      TenKH:     row.TenKH,
      Email:     row.Email,
      items: result.recordset.map(r => ({
        MaSP: r.MaSP, TenSP: r.TenSP,
        HinhAnh: r.HinhAnh, SoLuong: r.SoLuong, DonGia: r.DonGia,
      })),
    };

    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

module.exports = { 
  createOrder, 
  getMyOrders, 
  getAllOrders, 
  updateStatus, 
  getOrderById,
  getStats,      
};


