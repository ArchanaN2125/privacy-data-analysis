const AuditLog = require('../models/AuditLog');

/**
 * @route   POST /api/audit/log-event
 * @desc    Log a new audit event
 * @access  Private
 */
const logEvent = async (req, res, next) => {
    const { proofId, eventType, organizationId } = req.body;

    // organizationId can come from body, req.user, or default to 'GUEST'
    const orgId = organizationId || (req.user ? req.user.id : 'GUEST');

    if (!proofId || !eventType) {
        return res.status(400).json({ error: 'proofId and eventType are required' });
    }

    try {
        const newLog = new AuditLog({
            proofId,
            eventType,
            organizationId: orgId
        });

        await newLog.save();

        res.status(201).json({ message: 'Event logged successfully', logId: newLog._id });
    } catch (err) {
        next(err);
    }
};

/**
 * @route   GET /api/audit/audit-logs
 * @desc    Get all audit logs
 * @access  Admin Only
 */
const getAuditLogs = async (req, res, next) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    logEvent,
    getAuditLogs
};
