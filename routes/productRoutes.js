const express = require('express');
const { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct } = require("../controller/productCtrl");

const {isAdmin,authMiddleware}=require('../middilwares/authMiddleware')
const router = express.Router(); // Note the correction from express.router to express.Router()

router.post('/',authMiddleware,isAdmin, createProduct);
router.get("/:id", getaProduct);
router.put('/:id',authMiddleware,isAdmin,updateProduct);
router.delete('/:id',authMiddleware,isAdmin,deleteProduct);
router.get('/', getAllProduct);





module.exports = router; // Remove the .createProduct part from here