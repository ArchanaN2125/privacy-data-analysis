const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createProof, verifyProof } = require('../controllers/proofController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validatorMiddleware');

// Only Organizations and Admins can create proofs
router.post(
    '/create-proof',
    auth,
    checkRole(['Organization', 'Admin']),
    [
        body('hash').notEmpty().withMessage('Hash is required'),
        body('organizationId').notEmpty().withMessage('organizationId is required')
    ],
    validate,
    createProof
);

// Auditors and Admins can verify proofs
router.post(
    '/verify-proof',
    auth,
    checkRole(['Auditor', 'Admin']),
    [
        body('hash').notEmpty().withMessage('Hash is required for verification')
    ],
    validate,
    verifyProof
);

module.exports = router;
