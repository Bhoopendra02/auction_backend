const express = require('express');
const router = express.Router();

const itemController = require('../controller/ItemController'); 

const { checkRole, authenticate } = require('../middleware/authMiddleware');

// Public routes
router.get('/approved', itemController.getAllApproveItem);
router.get('/all', itemController.getAll);
router.get('/:id', itemController.getItemById);
router.get('/category/:categoryName', itemController.getItemsByCategory);
router.get('/category',itemController.category);

// User routes
router.post('/:id/bid', authenticate, itemController.placeBid);
router.get('/user/my-bids', authenticate, itemController.getMyBiddedAuctions);

// Seller routes
router.post('/create', checkRole(['seller']), itemController.createItem);
router.put('/update/:id', checkRole(['seller']), itemController.updateItem);
router.delete('/delete/:id', checkRole(['seller']), itemController.deleteItem);
router.get('/seller/my-items', checkRole(['seller']), itemController.getMyItems);

// Admin routes
router.get('/admin/pending', checkRole(['admin']), itemController.getAllAuction);
router.put('/admin/approve/:id', checkRole(['admin']), itemController.approveItem);
router.put('/admin/reject/:id', checkRole(['admin']), itemController.rejectItem);

module.exports = router;