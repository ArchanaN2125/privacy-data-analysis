const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    proofId: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
