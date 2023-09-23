const express = require('express');
const router = express.Router();
const { createUser, loginUserCtrl, getallUser,getaUser, deleteaUser, updatedUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword } = require('../controller/userCtrl'); // Import functions
const { authMiddleware, isAdmin } = require('../middilwares/authMiddleware');

const validateMongoDbId=require('../utils/validateMongodbid')
router.post('/register', createUser);
router.post('/forgotpasswordtoken', forgotPasswordToken);

router.post('/reset-password/:token', resetPassword);

router.put('/password',authMiddleware,updatePassword)
router.post('/login', loginUserCtrl);
router.get('/all-user', getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout",logout)
router.get('/:id',authMiddleware,isAdmin,getaUser);
router.delete('/:id', deleteaUser);
router.put('/edit-user', authMiddleware, updatedUser);
router.put('/block-user/:id', authMiddleware,isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);
module.exports = router;