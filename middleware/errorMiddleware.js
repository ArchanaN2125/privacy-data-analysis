/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Log the error for internal tracking (exclude request bodies for privacy)
    console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);

    res.status(statusCode).json({
        success: false,
        message: err.message,
        // Only show stack trace in development
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
