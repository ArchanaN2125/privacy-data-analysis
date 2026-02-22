const Proof = require('../models/Proof');
const { v4: uuidv4 } = require('uuid');
const { storeHashOnBlockchain } = require('../services/blockchainService');

/**
 * @route   POST /api/proof/create-proof
 * @desc    Create a new proof
 * @access  Private (should be protected by auth middleware)
 */
const createProof = async (req, res) => {
    const { hash, organizationId } = req.body;

    // Basic validation
    if (!hash || !organizationId) {
        return res.status(400).json({ error: 'Hash and organizationId are required' });
    }

    try {
        const proofId = uuidv4();
        const newProof = new Proof({
            proofId,
            hash,
            organizationId
        });

        await newProof.save();

        // Store hash on blockchain (placeholder)
        await storeHashOnBlockchain(hash, newProof.timestamp);

        res.status(201).json({ proofId });
    } catch (err) {
        console.error('Error creating proof:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * @route   POST /api/proof/verify-proof
 * @desc    Verify a proof by hash
 * @access  Private (should be protected by auth middleware)
 */
const verifyProof = async (req, res) => {
    const { hash } = req.body;

    // Basic validation
    if (!hash) {
        return res.status(400).json({ error: 'Hash is required for verification' });
    }

    try {
        // Search by either hash or proofId
        const proof = await Proof.findOne({
            $or: [{ hash: hash }, { proofId: hash }]
        });

        if (!proof) {
            return res.status(200).json({
                status: 'INVALID',
                message: 'No proof found for the provided identifier'
            });
        }

        res.status(200).json({
            status: 'VALID',
            timestamp: proof.timestamp,
            proofId: proof.proofId,
            organizationId: proof.organizationId
        });
    } catch (err) {
        console.error('Error verifying proof:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createProof,
    verifyProof
};
