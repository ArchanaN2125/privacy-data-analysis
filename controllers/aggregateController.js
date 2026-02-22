const AggregatedResult = require('../models/AggregatedResult');
const { v4: uuidv4 } = require('uuid');

/**
 * @route   POST /api/aggregate/compute-aggregate
 * @desc    Compute final percentage and store result
 * @access  Private
 */
const computeAggregate = async (req, res) => {
    const { totalStudents, passedStudents } = req.body;

    // Input validation
    if (totalStudents === undefined || passedStudents === undefined) {
        return res.status(400).json({ error: 'totalStudents and passedStudents are required' });
    }

    if (typeof totalStudents !== 'number' || typeof passedStudents !== 'number' || totalStudents <= 0) {
        return res.status(400).json({ error: 'Invalid input values. totalStudents must be greater than 0.' });
    }

    try {
        // 1. Compute final percentage
        const finalPercentage = (passedStudents / totalStudents) * 100;

        // 2. Prepare data for storage (Discarding raw totalStudents and passedStudents)
        const resultId = uuidv4();
        const timestamp = new Date();

        const newResult = new AggregatedResult({
            resultId,
            finalPercentage,
            timestamp
        });

        // 3. Store only the final percentage and timestamp
        await newResult.save();

        res.status(201).json({
            message: 'Aggregate result computed and stored successfully',
            resultId,
            finalPercentage: finalPercentage.toFixed(2)
        });
    } catch (err) {
        console.error('Error computing aggregate:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    computeAggregate
};
