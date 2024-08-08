const express = require('express');
const op = require('../Controllers/authController');
const router = express.Router();

router.post('/register', op.register);
router.post('/login', op.login);
router.post('/forgetPassword', op.forgetPassword);
router.post('/resetPassword/:resetToken', op.resetPassword);


module.exports = router;