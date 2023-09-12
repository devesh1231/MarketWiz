const asyncHandler = require('express-async-handler');
const User = require('../models/Usermodel');
const { generateToken } = require('../config/jwttoken');
const validateMongoDbId = require('../utils/validateMongodbid');
const { generateRefreshToken } = require('../config/refreshToken');
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

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Check if the user exists
    const findUser = await User.findOne({ email });
    if (findUser && findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser_id);
        const updateuser = await User.findByIdAndUpdate(findUser?.id, {
            refreshToken: refreshToken,
        },
            {
            new:true,
        });
        res.json({
            _id: findUser?._id,
            Firstname: findUser?.Firstname,
            Lastname: findUser?.Lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?.id),
        }); // Send a response
    } else {
        throw new Error("Invalid credentials"); // Throw an error using the Error constructor
    }
    // Implement your login logic here
});

// Get all users

const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) { // Added error variable here
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

module.exports = {
    createUser,
    loginUserCtrl,
    getallUser,
    getaUser,
    deleteaUser,
    updatedUser,
    blockUser,
    unblockUser,
};
