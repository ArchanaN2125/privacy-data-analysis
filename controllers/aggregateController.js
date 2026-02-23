const AggregatedResult = require('../models/AggregatedResult');
const { v4: uuidv4 } = require('uuid');

/**
 * @route   POST /api/aggregate/compute-aggregate
 * @desc    Compute final percentage and store result
 * @access  Private
 */
const computeAggregate = async (req, res, next) => {
    const { totalStudents, passedStudents } = req.body;

    // Computation: (passedStudents / totalStudents) * 100
    try {
        const finalPercentage = parseFloat(((passedStudents / totalStudents) * 100).toFixed(2));
        const timestamp = new Date();

        const newResult = new AggregatedResult({
            finalPercentage,
            timestamp
        });

        // Store ONLY finalPercentage and timestamp
        await newResult.save();

        res.status(201).json({
            success: true,
            message: 'Aggregate result computed and stored successfully',
            finalPercentage
        });

        // Raw inputs (totalStudents, passedStudents) are naturally discarded 
        // as they are local variables and not stored anywhere.
    } catch (err) {
        next(err);
    }
};

/**
 * @route   GET /api/aggregate/history
 * @desc    Get aggregate history
 * @access  Private
 */
const getAggregateHistory = async (req, res, next) => {
    try {
        const results = await AggregatedResult.find().sort({ timestamp: -1 });
        res.json(results);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    computeAggregate,
    getAggregateHistory
};
