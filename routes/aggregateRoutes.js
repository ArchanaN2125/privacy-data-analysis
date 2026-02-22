const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { computeAggregate } = require('../controllers/aggregateController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validatorMiddleware');

// Organizations and Admins can compute aggregates
router.post(
    '/compute-aggregate',
    auth,
    checkRole(['Organization', 'Admin']),
    [
        body('totalStudents').isNumeric().withMessage('totalStudents must be a number')
            .custom(value => value > 0).withMessage('totalStudents must be greater than 0'),
        body('passedStudents').isNumeric().withMessage('passedStudents must be a number')
    ],
    validate,
    computeAggregate
);

module.exports = router;
