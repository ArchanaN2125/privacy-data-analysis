const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createProof, verifyProof, getProofHistory } = require('../controllers/proofController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validatorMiddleware');

// [DEVELOPMENT MODE] Auth disabled for all proof routes
router.post(
    '/create-proof',
    [
        body('hash').notEmpty().withMessage('Hash is required'),
        body('organizationId').notEmpty().withMessage('organizationId is required')
    ],
    validate,
    createProof
);

// [DEVELOPMENT MODE] Auth disabled for verify
router.post(
    '/verify-proof',
    [
        body('hash').notEmpty().withMessage('Hash is required for verification')
    ],
    validate,
    verifyProof
);

// [DEVELOPMENT MODE] Auth disabled for history
router.get('/history', getProofHistory);

module.exports = router;
