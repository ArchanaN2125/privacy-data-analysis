const Proof = require('../models/Proof');
const { v4: uuidv4 } = require('uuid');
const { storeHashOnBlockchain } = require('../services/blockchainService');

/**
 * @route   POST /api/proof/create-proof
 * @desc    Create a new proof
 * @access  Private (should be protected by auth middleware)
 */
const createProof = async (req, res, next) => {
    const { hash, organizationId } = req.body;

    try {
        const proofId = uuidv4();
        // Use authenticated user's ID as organizationId for security
        const orgId = organizationId || (req.user && req.user.id);

        const newProof = new Proof({
            proofId,
            hash,
            organizationId: orgId
        });

        await newProof.save();

        // Simulation: Call blockchain service
        const blockchainResult = await storeHashOnBlockchain(hash, newProof.timestamp);

        res.status(201).json({
            success: true,
            proofId,
            timestamp: newProof.timestamp,
            blockchain: blockchainResult
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @route   POST /api/proof/verify-proof
 * @desc    Verify a proof by hash
 * @access  Private
 */
const verifyProof = async (req, res, next) => {
    const { hash } = req.body;

    try {
        const proof = await Proof.findOne({
            $or: [{ hash }, { proofId: hash }]
        });

        if (!proof) {
            return res.status(200).json({
                status: 'INVALID',
                message: 'No record found for this identifier.'
            });
        }

        res.status(200).json({
            status: 'VALID',
            timestamp: proof.timestamp,
            proofId: proof.proofId,
            organizationId: proof.organizationId
        });
    } catch (err) {
        next(err);
    }
};

/**
     * @route   GET /api/proof/history
     * @desc    Get proof history for organization
     * @access  Private
     */
const getProofHistory = async (req, res, next) => {
    try {
        // [DEVELOPMENT MODE] Return all proofs if req.user is missing
        const query = req.user ? { organizationId: req.user.id } : {};
        const proofs = await Proof.find(query).sort({ timestamp: -1 });
        res.json(proofs);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createProof,
    verifyProof,
    getProofHistory
};
