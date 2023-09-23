//not found

const notFound = (req, res, next) => {
    const error = new Error(`Not found : ${req.originalUrl}`);
    res.status(404);
    next(error);
}

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Fix variable name
    res.status(statusCode); // Correct the method name
    res.json({
        message: err.message, // Use err.message directly
        stack: err.stack,     // Use err.stack directly
    });
};

module.exports = {notFound,errorHandler };
