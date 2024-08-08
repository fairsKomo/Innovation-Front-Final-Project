# Welcome To My Final Project
This is the final project of Innovation Front summer training.

## Description
My project was basically a e-commerce system. In the system there are two kind of people or let`s say roles which are regular user (Customer) and the admin and each of them has a specific set of credintails and endpoints.
Also we have to schemas one for products and other for Users.

### Users Schema
| Attribute | Data Type | Rules |
| ----------- | ----------- | ----------- |
| First Name | String | No Rules |
| Last Name | String | No Rules |
| Email | String | Follows email rules & unique |
| Username | String | Unique & alphanum |
| Password | String | 8 Chars at least & Lower and Upper case & Numbers & Special Chars |
| History | Array | No Rules |
| Cart | Array | No Rules |
| CartTotalPrice | Number | No Rules |


### Products Schema
| Attribute | Data Type | Rules |
| ----------- | ----------- | ----------- |
| Name | String | No Rules |
| Description | String | No Rules |
| Price | Number | Sholud be greater than zero |
| Category | String | No Rules |
| Stock | Number | Non-negative Integer |

## Users Functionalities
### Admin
Admin Contains A complete Set of CRUD Opreations as the following:
- Get all users \ products
- Get user \ product by id
- Add new user \ product
- Update user \ product
- Delete user \ product
- Get the whole history pf purchases of a customer

### Regular User
The regular user has a set of functionalties that simulate a real e-commerce system and below I will explain it:
- Get the whole history pf purchases of himself
- Get the cart of himself
- Add a product to the cart (Will be explained)
- Purchase the items in the cart (Will be explained)

## Explanation of Some Functionalities

### Add To Cart 
This function ensures that items are added to the cart while considering stock availability and updates the cart's total price. It also handles various edge cases, such as insufficient stock and non-existent products, providing appropriate feedback to the user.
```javascript
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
```
### Make Purchase
The makePurchase function ensures that all items in the cart are available and in stock before processing the purchase. It updates the stock for each item, records the purchase in the user's history, and clears the cart. This function handles various edge cases, such as empty carts, unavailable products, and insufficient stock, providing appropriate feedback to the user.
```javascript
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
```
## Authrization
The systam allows only authrized entity to access his services using two middlwares one to authinticate the admin and the other to make sure that the suser is signed in so he can do his desired services.
### Admin Authrization
The adminMiddleware function serves as a security measure to ensure that only users with an "admin" role can access certain routes. It checks for the presence of a valid JWT, verifies it against a secret key, and ensures that the user associated with the token is an admin. If any of these conditions are not met, the function responds with an appropriate error message and status code.
```javascript
const adminMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if(!authHeader) return res.status(404).json({message: 'No token provided!'});

    const token = authHeader.split(' ')[1];
    if(!token) return res.status(404).json({message: 'No token provided!'});

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if(!user) return res.status(404).json({message: 'No token provided!'});
        if(user.role !== 'admin') return res.status(403).json({message: 'Access denied!'});

        req.user = decoded;
        next();
    } catch(e){
        return res.status(400).json({message: 'Token invalid!'});
    }
};
```

### JWT Authrization
The authenticateJWT function is responsible for verifying the presence and validity of a JSON Web Token in the request. If the token is valid, it attaches the decoded user information to the request object and allows the request to proceed. If the token is missing or invalid, it responds with an appropriate error message and status code.
```javascript
const authinticateJWT = (req, res, next) => {
    const token = req.header('Authorization').split(' ')[1];

    if(!token) return res.status(401).json({ message: 'Authentication token is required' });

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err){
        res.status(500).json({message: err.message});
    }
};
```

## Authintication
Our system supports the authintication opreations including log-in, register, forget password and reset password.

### Log-in
The login function authenticates users by verifying their username and password. If the credentials are correct, it generates and returns a JWT that can be used for subsequent authenticated requests. The function handles various edge cases, such as invalid credentials, and ensures appropriate error handling.
```javascript
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
```

### Register
The register function handles user registration by validating the input data, creating a new user, and saving it to the database. It provides appropriate feedback if there are validation issues or if any errors occur during the registration process. The function ensures that the user receives a response with either the successfully created user object or an error message.
```javascript
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
```

### Forget Password
The forgetPassword function manages the password reset process by validating the user's email, generating a reset token, updating the user's record, and sending an email with the reset link. It ensures proper error handling and provides feedback based on the success or failure of email delivery.
```javascript
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'farisbusiness5@gmail.com',
        pass: process.env.TRANSPORTER_PASSWORD
    }
});
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
```

### Reset Password
The resetPassword function processes password reset requests by verifying the validity and expiration of the reset token. It updates the user's password and clears the token and expiration fields. The function ensures appropriate feedback for invalid or expired tokens and handles errors gracefully.
```javascript
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
```

## Validation
For validation I used a library called joi whcih facilitates this proccess.

### User Validation
The validateReg function performs validation of user registration data using Joi. It checks that all required fields are provided and conform to specified patterns, especially for the password. It returns the result of the validation process, including any errors and the validated data.
```javascript
const validateReg = (data) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const studentSchema = joi.object({
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        email: joi.string().email().required(),
        username: joi.string().alphanum().required(),
        password: joi.string().pattern(passwordPattern).required(),
        role: joi.string().valid('user', 'admin').default('user'),
    });

    const { error, value } = studentSchema.validate(data);

    return { error, value };
}
```
