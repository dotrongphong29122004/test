const router = require('express').Router();
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middlewares/auth.middleware');

router.get('/',      productController.getAll);           // Public — ?category=&search=&sort=&minPrice=&maxPrice=
router.get('/:id',   productController.getById);          // Public
router.post('/',     verifyAdmin, productController.create);
router.put('/:id',   verifyAdmin, productController.update);
router.delete('/:id',verifyAdmin, productController.remove);

module.exports = router;

const upload = require('../middlewares/upload.middleware');

// Upload ảnh — trả về đường dẫn
router.post('/upload-image', verifyAdmin, upload.single('image'), (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: 'Không có file ảnh' });

  const imageUrl = `/uploads/products/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});