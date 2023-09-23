const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 8080;
const authRouter = require('./routes/authRoutes');
const productRouter=require("./routes/productRoutes")
const bodyParser = require('body-parser');
const {notFound,errorHandler}=require('./middilwares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');


dbConnect();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/user', authRouter);
app.use('/api/product',productRouter);

app.use(notFound);
app.use(errorHandler);
app.listen(3000, () => {
    console.log(`Server is running at PORT ${PORT}`);
});
