const mongoose = require('mongoose');

const aggregatedResultSchema = new mongoose.Schema({
    resultId: {
        type: String,
        required: true
    },
    finalPercentage: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('AggregatedResult', aggregatedResultSchema);
