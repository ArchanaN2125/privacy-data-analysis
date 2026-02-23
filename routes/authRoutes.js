const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const validate = require('../middleware/validatorMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post(
    '/register',
    authLimiter,
    [
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be 6 or more characters'),
        body('role').optional().isIn(['Admin', 'Organization', 'Auditor']).withMessage('Invalid role')
    ],
    validate,
    register
);

router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password').exists().withMessage('Password is required')
    ],
    validate,
    login
);

module.exports = router;
