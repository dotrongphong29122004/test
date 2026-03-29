const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

router.get('/stats', verifyAdmin, orderController.getStats);
router.post('/',           verifyToken, orderController.createOrder);   // Đặt hàng
router.get('/my',          verifyToken, orderController.getMyOrders);   // Lịch sử của tôi
router.get('/',            verifyAdmin, orderController.getAllOrders);   // Tất cả [Admin]
router.put('/:id/status',  verifyAdmin, orderController.updateStatus);  // Cập nhật trạng thái [Admin]
router.get('/:id', verifyToken, orderController.getOrderById);


module.exports = router;