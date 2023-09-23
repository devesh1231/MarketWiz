const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require('slugify');

// Create a Product
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        req.body.slug = slugify(req.body.title);

        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// Update a Product
const updateProduct = asyncHandler(async (req, res) => {
    const id = req.params.id; // Correctly extract the id

    if (req.body.title) {
        req.body.slug = slugify(req.body.title);
    }

    try {
        const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
            new: true,
        });

        if (!updateProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a Product
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params; // Destructure id from req.params

    try {
        const deletedProduct = await Product.findByIdAndDelete(id); // Use id as a string

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(deletedProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a Product by ID
const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const findProduct = await Product.findById(id);

        if (!findProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// Get All Products
const getAllProduct = asyncHandler(async (req, res) => {
    try {
        // Filtration
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((ele) => delete queryObj[ele]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // Limiting the fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // Pagination

        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        console.log(page, limit, skip);
        query = query.skip(skip).limit(limit);
        if (req.query.page)
        {
            const productCount = await Product.countDocuments();
            if (skip >= productCount)
                throw new Error("This Page Does Not Exist");
            }




        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct };
