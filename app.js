require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const adminRouter = require('./Routes/adminRoutes');
const userRouter = require('./Routes/userRoutes');
const authRouter = require('./Routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const conn = process.env.DB_CONNECTION_STRING;

mongoose.connect(conn)
    .then(() => console.log("MongoDB Connected Successfully :)"))
    .catch(er => console.error("Error Occurred", er));

app.use(express.json());

app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);

app.listen(PORT, console.log(`App is listening to http://localhost:${PORT}`));