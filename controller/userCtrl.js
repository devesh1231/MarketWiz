const asyncHandler = require('express-async-handler');
const User = require('../models/Usermodel');
const { generateToken } = require('../config/jwttoken');
const validateMongoDbId = require('../utils/validateMongodbid');
const { generateRefreshToken } = require('../config/refreshToken');

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailCtrl');
const { error } = require('console');
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email });
    if (!findUser) {
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        throw new Error("User already exists");
    }
});
//login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists
    const findUser = await User.findOne({ email });

    if (!findUser) {
        // User not found, return "Invalid credentials"
        throw new Error("Invalid credentials");
    }

    // Check if the password matches
    const isPasswordMatch = await findUser.isPasswordMatched(password);

    if (!isPasswordMatch) {
        // Password doesn't match, return "Invalid credentials"
        throw new Error("Invalid credentials");
    }

    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateuser = await User.findByIdAndUpdate(
        findUser?.id,
        {
            refreshToken: refreshToken,
        },
        {
            new: true,
        }
    );

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
    });

    res.json({
        _id: findUser?._id,
        Firstname: findUser?.Firstname,
        Lastname: findUser?.Lastname,
        email: findUser?.email,
        mobile: findUser?.mobile,
        refreshToken: generateToken(findUser?.id),
    }); // Send a response
});



// Get all users

const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) { 
        throw new Error(error);
    }
});

/// get a single user

const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
    console.log(id);
});

/////delete a user
const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
        validateMongoDbId(id);

    console.log(id); // Log the id to ensure it's correct
    try {
        const deleteuser = await User.findByIdAndDelete(id);
        console.log("Deleted User:", deleteuser); // Log the deleted user
        if (!deleteuser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error); // Log any errors
        if (error instanceof mongoose.Error) {
            return res.status(500).json({ message: 'Mongoose error: ' + error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// handle referesh token

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
   
    if (!cookie?.refreshToken) {
        throw new Error("No Refresh Token In cookies");
    }
    const refreshToken = cookie.refreshToken;
    //  console.log(refreshToken);
    const user = await User.findOne({ refreshToken });
    if (!user) {
        throw new Error("no refresh token is present in databse");
    }
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("there is something wrong with refresh token")
        }
        const accessToken = generateToken(user);
        res.json({ accessToken });
        console.log(decoded);
    });
   
});

//logout functionality

const logout = asyncHandler(async (req, res) => {

  const cookie = req.cookies;

  if (!cookie?.refreshToken) {
    throw new Error("No refreshToken in cookies"); 
  }

  const refreshToken = cookie.refreshToken;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true
    });
    
    return res.sendStatus(204); // No content
  }

  await User.findOneAndUpdate(
    { refreshToken }, // Filter
    { refreshToken: "" } // Update
  );

  res.clearCookie("refreshToken", {
    httpOnly: true, 
    secure: true
  });
  
  res.sendStatus(204); // No content
});

//update a user

const updatedUser = asyncHandler(async (req, res) => {
    console.log("hiidevesh you done it");
    const { _id } = req.user;
    validateMongoDbId(_id);
    console.log(_id);
    try {
        // Issue: You need to add the option { new: true } to get the updated document
        const updatedUser = await User.findByIdAndUpdate(_id, {
            Firstname: req.body.Firstname,
            Lastname: req.body.Lastname,
            email: req.body.email,
            mobile: req.body.mobile,
        }, { new: true }); // Add { new: true } to get the updated document
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        if (error instanceof mongoose.Error) {
            return res.status(500).json({ message: 'Mongoose error: ' + error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
        validateMongoDbId(id);

    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: true,
        }, {
            new: true,
        });
        res.json({
            block,
            message: "User blocked",
        });
    } catch (error) {
        throw new Error(error);
    }
});

const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
        validateMongoDbId(id);

    try {
        const unblock = await User.findByIdAndUpdate(id, {
            isBlocked: false,
        }, {
            new: true,
        });
        res.json({
            message: "User unblocked",
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    console.log("hii");
    console.log(req.body);
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById((_id));
    if (password)
    {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    }
    else
    {
        res.json(user);
        }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    console.log("hii");
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new Error("User not found with this email");
    }

    try {
        const token = await user.createPasswordToken();
        await user.save();
        const resetURL = `http://localhost:3000/api/user/reset-password/${token}`; // Correct the URL format
        const data = {
            to: email,
            subject: "Reset Password",
            html: `Hi, please follow this link to reset your password. This link is valid for the next 10 minutes: <a href="${resetURL}">${resetURL}</a>`
        };
        await sendEmail(data); // Assuming sendEmail returns a promise
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async (req, res) => {
   const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: { $gt: Date.now() }
    });

    if (!user) {
        // Log a message to help with debugging
        console.log("User not found or token expired");
        return res.status(400).json({ message: "Token expired or user not found" });
    }
    if (!user) throw new Error("token expired please try again");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    res.json(user);
        
})
module.exports = {
    createUser,
    loginUserCtrl,
    getallUser,
    getaUser,
    deleteaUser,
    updatedUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
};
