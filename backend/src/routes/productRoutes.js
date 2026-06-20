const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getSellerProducts,
    updateStock,
    getProductsByCategory
} = require('../controllers/productController');

// Validation rules
const productValidation = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('unit').isIn(['kg', 'gram', 'litre', 'ml', 'dozen', 'piece', 'box', 'bundle'])
        .withMessage('Invalid unit'),
    body('pricePerUnit').isNumeric().withMessage('Price must be a number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer')
];

// Public routes (authentication optional)
router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/seller/:sellerId', getSellerProducts);
router.get('/:id', getProductById);

// Protected routes - Allow both kirana_user and big_market_seller
router.post(
    '/',
    authMiddleware,
    roleMiddleware('kirana_user', 'big_market_seller'),  // UPDATED
    upload.array('images', 5),
    productValidation,
    createProduct
);

router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('kirana_user', 'big_market_seller'),  // UPDATED
    upload.array('images', 5),
    updateProduct
);

router.put(
    '/:id/stock',
    authMiddleware,
    roleMiddleware('kirana_user', 'big_market_seller'),  // UPDATED
    updateStock
);

router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware('kirana_user', 'big_market_seller'),  // UPDATED
    deleteProduct
);

module.exports = router;