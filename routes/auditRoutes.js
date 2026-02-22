const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { logEvent } = require('../controllers/auditController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validatorMiddleware');

// Auditors and Admins can log events
router.post(
    '/log-event',
    auth,
    checkRole(['Auditor', 'Admin']),
    [
        body('proofId').notEmpty().withMessage('proofId is required'),
        body('eventType').notEmpty().withMessage('eventType is required')
    ],
    validate,
    logEvent
);

module.exports = router;
