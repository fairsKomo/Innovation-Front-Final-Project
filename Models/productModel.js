const mongoose = require('mongoose');

const productSchma = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    // Must be positive
    price: {
        type: Number,
        required: true,
        min: [0.01, "Price Should be nonzero"]
    },

    category: {
        type: String,
        required: true
    },

    // >= 0
    stock: {
        type: Number,
        required: true,
        min: [0, "Stock Should be >= 0"]
    }
})

module.exports = mongoose.model('Product', productSchma);