const User = require('../Models/userModel');
const Product = require('../Models/productModel');


const getHistory = async (req, res) => {
    try{
        const id = req.user.id;
        const user = await User.findById(id).populate('history.items.productId');

        if(!user) return res.status(404).json({messgae: "Product Not Found"});

        const history = user.history;
        res.status(200).json({history});
    } catch(e){
        res.status(500).json({error: e.message});
    }
}

const getCart = async (req, res) => {
    try{
        const id = req.user.id;
        const user = await User.findById(id).populate('cart.productId');

        if(!user) return res.status(404).json({messgae: "User Not Found"});

        const cart = user.cart;
        total = user.cartTotalPrice;
        res.status(200).json({cart, total});
    } catch(e){
        res.status(500).json({error: e.message});
    }
}

const addToCart = async (req, res) =>{
    try{
        const userId = req.user.id;
        const itemId = req.body.prodId;
        const quantity = req.body.quantity;
        const user = await User.findById(userId);
        const item = user.cart.find(item => item.productId.toString() === itemId);
        const newItem = await Product.findById(itemId);

        if(item){
            temp = item.quantity + quantity;
            if(temp > newItem.stock) return res.status(500).json({message : "The stock isn`t sufficient!"});

            item.quantity += quantity;
        } else {
            if(!newItem) return res.status(404).json({message : "Product doesn`t exist"});
            if(quantity > newItem.stock) return res.status(500).json({message : "The stock isn`t sufficient!"});

            price = newItem.price;
            user.cart.push({productId: itemId, quantity: quantity, price: price});
        }

        const cartTotalPrice = user.cart.reduce((total, item) => {
            return total + (item.quantity * item.price);
        }, 0);

        user.cartTotalPrice = cartTotalPrice;

        await user.save();
        res.status(200).json({message : "Item added successfuly"});

    } catch(e){
        res.status(500).json({message : e.message});
    }
}

const makePurchase = async (req, res) =>{

    try{
        const id = req.user.id;
        const user = await User.findById(id);

        if(user.cart.length === 0) return res.status(500).json({message : "Cart is empty"});

        for(const item of user.cart){
            const prod = await Product.findById(item.productId);

            if(!prod) return res.status(404).json({message: "Unfourtentaly this ite is no longer availble :("});

            if(item.quantity > prod.stock) return res.status(400).json({message: "There is no suffiecient stock :("});

            prod.stock -= item.quantity;
            await prod.save();
        }
        
        const purchase = {
            date: new Date,
            totalPrice: user.cartTotalPrice,
            items: user.cart
        };

        user.history.push(purchase);

        user.cart = [];
        user.cartTotalPrice = 0;

        await user.save();
        res.status(200).json({message : "Purchased successfuly"});

    } catch(e){
        res.status(500).json({message: e.message});
    }
}

module.exports = {
    addToCart,
    makePurchase,
    getCart,
    getHistory
};