const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { computeAggregate, getAggregateHistory } = require('../controllers/aggregateController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validatorMiddleware');

// [DEVELOPMENT MODE] Auth disabled for demo
router.post(
    '/compute-aggregate',
    // auth,
    // checkRole(['Organization', 'Admin']),
    [
        body('totalStudents')
            .notEmpty().withMessage('totalStudents is required')
            .isNumeric().withMessage('totalStudents must be a number')
            .custom(value => value > 0).withMessage('totalStudents must be greater than 0'),
        body('passedStudents')
            .notEmpty().withMessage('passedStudents is required')
            .isNumeric().withMessage('passedStudents must be a number')
            .custom((value, { req }) => value <= req.body.totalStudents).withMessage('passedStudents cannot be greater than totalStudents')
    ],
    validate,
    computeAggregate
);

// [DEVELOPMENT MODE] Auth disabled for history
router.get('/history', getAggregateHistory);

module.exports = router;
