const mongoose = require('mongoose');

const dbConnect = () => {
    try {
        const conn = mongoose.connect('mongodb://127.0.0.1:27017/digitic', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database error:", err);
    }
};

module.exports = dbConnect;
