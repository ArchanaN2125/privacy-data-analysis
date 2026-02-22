const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    proofId: {
        type: String,
        default: uuidv4
    },
    role: {
        type: String,
        enum: ['Organization', 'Auditor', 'Admin'],
        default: 'Organization'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
