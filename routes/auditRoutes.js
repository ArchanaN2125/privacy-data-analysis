const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { logEvent, getAuditLogs } = require('../controllers/auditController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validatorMiddleware');

// [DEVELOPMENT MODE] Auth disabled on all audit routes
router.post(
    '/log-event',
    [
        body('proofId').notEmpty().withMessage('proofId is required'),
        body('eventType').notEmpty().withMessage('eventType is required')
    ],
    validate,
    logEvent
);

// [DEVELOPMENT MODE] Auth disabled for audit logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
