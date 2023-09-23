const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/Usermodel");

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log(decoded);
                const user = await User.findById(decoded?.id);
             //   console.log(user);
                req.user = user;
                next(); // Call next only if the token verification is successful
            }
        } catch (error) {
            throw new Error("not authorised token expired, please login again");
        }
    } else {
        throw new Error("there is no token attached to the header");
    }
});

module.exports = { authMiddleware };
   


const isAdmin = asyncHandler(async (req, res, next) => { // Added the 'next' parameter
    // You can access the user information stored in req.user here
  //  console.log("hii");
    //console.log(req.user);
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (adminUser.role !== "admin") {
        throw new Error('You are not an admin');
    } else {
        next(); // Continue with the next middleware or route handler
    }
});

module.exports = { authMiddleware, isAdmin };
