const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { required } = require('joi');
const userSchema = new mongoose.Schema({
    
    // Only english letters
    firstName: {
        type: String,
        required: true,
    },

    // Only english letters
    lastName: {
        type: String,
        required: true,
    },
    
    // unique and valid
    email: {
        type: String,
        required: true,
        unique: true
    },

    // unique, english Letters, Numbers
    username: {
        type: String,
        required: true,
        unique: true
    },

    // 8 Chars minimum, uppercase & lowercase & nums & specialchars
    password: {
        type: String,
        required: true,
    },

    history: [{
        date: {
            type: Date,
            required: true
        },

        totalPrice: {
            type: Number,
            required: true
        },

        items: [{
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                default: 1
            },

            price: {
                type: Number,
                required: true
            }
        }]
    }],

    cart: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        price: {
            type: Number,
            required: true,
        }
    }],

    cartTotalPrice: {
        type: Number,
        default: 0
    },

    // enum[User, admin] default User
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin'],
        default: 'user'
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.pre('save', async function(next) {
    if(this.isModified('password') || this.isNew){
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
})

module.exports = mongoose.model('User', userSchema);