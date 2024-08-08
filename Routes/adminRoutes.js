const express = require('express');
const op = require('../Controllers/adminController');
const adminMiddleware = require('../Middlewares/adminAuthrization');
const router = express.Router();

router.get('/user',  adminMiddleware, op.getAllUsers);
router.get('/user/:id', adminMiddleware, op.getByUserID);
router.get('/prod', adminMiddleware, op.getAllProducts);
router.get('/prod/:id', adminMiddleware, op.getByProdID);
router.get('/hist/:id', adminMiddleware, op.getUserHistory);

router.post('/user', adminMiddleware, op.createNewUser);
router.post('/prod', adminMiddleware, op.createNewProd);

router.put('/user/:id', adminMiddleware, op.updateOneUser);
router.put('/prod/:id', adminMiddleware, op.updateOneProd);

router.delete('/user/:id', adminMiddleware, op.deleteOneUser);
router.delete('/prod/:id', adminMiddleware, op.deleteOneProd);

module.exports = router;