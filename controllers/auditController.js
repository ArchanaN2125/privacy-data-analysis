const AuditLog = require('../models/AuditLog');

/**
 * @route   POST /api/audit/log-event
 * @desc    Log a new audit event
 * @access  Private
 */
const logEvent = async (req, res) => {
    const { proofId, eventType } = req.body;

    if (!proofId || !eventType) {
        return res.status(400).json({ error: 'proofId and eventType are required' });
    }

    try {
        const newLog = new AuditLog({
            proofId,
            eventType
        });

        await newLog.save();

        res.status(201).json({ message: 'Event logged successfully', logId: newLog._id });
    } catch (err) {
        console.error('Error logging audit event:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    logEvent
};
