const User = require('../Models/userModel');
const Product = require('../Models/productModel');

const getAllUsers = async (req, res) => {
    try{
        const users = await User.find();
        res.status(200).json({users})
    } catch(e){
        res.status(500).json({error: e.message});
    }
};

const getAllProducts = async (req, res) => {
    try{
        const product = await Product.find();
        res.status(200).json({product})
    } catch(e){
        res.status(500).json({error: e.message});
    }
};


const getByUserID = async (req, res) => {
    try{
        const id = req.params.id;
        const user = await User.findById(id);
        if(!user) return res.status(404).json({message : `No User with the ID: ${id}`});
        res.status(200).json({user})
    } catch(e){
        res.status(500).json({error: e.message});
    }
};

const getByProdID = async (req, res) => {
    try{
        const id = req.params.id;
        const prod = await Product.findById(id);
        if(!prod) return res.status(404).json({message : `No User with the ID: ${id}`});
        res.status(200).json({prod})
    } catch(e){
        res.status(500).json({error: e.message});
    }
};

const createNewUser = async (req, res) => {
    try{
        const data = req.body;
        const user = new User(data);
        await User.create(user);
        res.status(201).json({user});
    } catch(e){
        res.status(500).json({error: e.message});
    }
};

const createNewProd = async (req, res) => {
    try{
        const data = req.body;
        const prod = new Product(data);
        await Product.create(prod);
        res.status(201).json({prod});
    } catch(e){
        res.status(500).json({error: e.message});
    }
};

const updateOneUser = async (req, res) => {
    try{
        const id = req.params.id;
        const data = req.body;
        const user = await User.findByIdAndUpdate(id, data, {new: true});
        if(!user) return res.status(404).json({messgae: "User Not Found"});
        res.status(200).json({user});
    } catch(e){
        res.status(500).json({error: e.message});
    }
};

const updateOneProd = async (req, res) => {
    try{
        const id = req.params.id;
        const data = req.body;
        const prod = await Product.findByIdAndUpdate(id, data, {new: true});
        if(!prod) return res.status(404).json({messgae: "Product Not Found"});
        res.status(200).json({prod});
    } catch(e){
        res.status(500).json({error: e.message});
    }
};

const deleteOneUser = async (req, res) => {
    try{
        const id = req.params.id;
        const user = await User.findByIdAndDelete(id);
        if(!user) return res.status(404).json({messgae: "User Not Found"});
        res.status(204).json({user});
    } catch(e){
        res.status(500).json({error: e.message});
    }
};

const deleteOneProd = async (req, res) => {
    try{
        const id = req.params.id;
        const prod = await Product.findByIdAndDelete(id);
        if(!prod) return res.status(404).json({messgae: "Product Not Found"});
        res.status(204).json({prod});
    } catch(e){
        res.status(500).json({error: e.message});
    }
};

const getUserHistory = async (req, res) => {
    try{
        const id = req.params.id;
        const user = await User.findById(id).populate('history.items.productId');

        if(!user) return res.status(404).json({messgae: "Product Not Found"});

        const history = user.history;
        res.status(200).json({history});
    } catch(e){
        res.status(500).json({error: e.message});
    }
}

module.exports = {
    getAllUsers,
    getAllProducts,
    getByUserID,
    getByProdID,
    createNewUser,
    createNewProd,
    updateOneUser,
    updateOneProd,
    deleteOneUser,
    deleteOneProd,
    getUserHistory
};