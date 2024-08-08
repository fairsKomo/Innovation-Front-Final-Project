const express = require('express');
const op = require('../Controllers/userController');
const authinticateJWT = require('../Middlewares/authinticateJWT');
const router = express.Router();

router.get('/hist', authinticateJWT, op.getHistory);
router.get('/cart', authinticateJWT, op.getCart);


router.post('/add', authinticateJWT, op.addToCart);
router.post('/purchase', authinticateJWT, op.makePurchase);


module.exports = router;