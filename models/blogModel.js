const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    numViews: {
        type: Number,
        default: 0,
    },
    isLiked: {
        type: Boolean,
        default: false,
    },
    isDisliked: {
        type: Boolean,
        default: false,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    image: {
        type: String,
        default: "https://www.pakainfo.com/wp-content/uploads/2021/09/image-url-for-testing.jpg"
    },
    author: {
        type: String,
        default: "Admin",
    },
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true,
    },
    timestamps: true, // Corrected to 'timestamps'
});

//Export the model
module.exports = mongoose.model('Blog', blogSchema);
