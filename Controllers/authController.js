const User = require('../Models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validate = require('../Utills/userValidation');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'farisbusiness5@gmail.com',
        pass: process.env.TRANSPORTER_PASSWORD
    }
});

const register = async (req, res) => {
    try{
        const {error, value} = validate.validateReg(req.body);

        if(error) return res.status(400).json({error: error.details[0].message});

        const user = new User(value);
        await user.save();
        res.status(200).json({user});
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

const login = async (req, res) => {
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username});

        if(!user) return res.status(400).json({message: "Invalid Username or Password"});

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) return res.status(400).json({message: "Invalid Username or Password"});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.status(200).json({token});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

const forgetPassword = async (req, res) => {
    try{
        const {email} = req.body;
        const user = await User.findOne({email});

        if(!user) return res.status(404).json({message: "This E-mail doesn`t exist"});

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 360000;
        await user.save();

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        console.log(user);

        const mailOptions = {
            to: user.email,
            from: 'farisbusiness5@gmail.com',
            subject: 'Password Reset Request',
            text: `Hello ${user.firstName},
        
        You are receiving this email because we received a request to reset the password for your account. To reset your password, please click the following link:
        
        ${resetUrl}
        
        If you did not request a password reset, please disregard this email. No changes will be made to your account.
        
        Best regards,
        Faris Komo`
        };

        transporter.sendMail(mailOptions, (error) => {
            if(error) return res.status(500).json({error});

            return res.status(200).json({message: 'Email Sent'});
        })
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

const resetPassword = async (req, res) => {
    try{
        const {resetToken} = req.params;
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {$gt: Date.now()}
        });

        if(!user) {
            return res.status(400).json({ message: "Token is invalid or it has expired" });
        }

        user.password = req.body.password;
        user.resetPasswordExpires = undefined;
        user.resetPasswordToken = undefined;

        await user.save();

        res.status(200).json({ message: "Your password has been reset successfully :)" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    register,
    login,
    forgetPassword,
    resetPassword
}