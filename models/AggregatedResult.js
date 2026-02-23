const mongoose = require('mongoose');

const aggregatedResultSchema = new mongoose.Schema({
    finalPercentage: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: false }); // Disable timestamps if not needed, or keep for metadata

module.exports = mongoose.model('AggregatedResult', aggregatedResultSchema);
