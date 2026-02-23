const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const register = async (req, res, next) => {
    const { organizationId, password, role } = req.body;
    try {
        let user = await User.findOne({ organizationId });
        if (user) {
            return res.status(400).json({ msg: 'Organization already exists' });
        }

        user = new User({
            organizationId,
            password,
            role: role || 'Organization'
        });

        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '2h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token });
            }
        );
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    const { organizationId, password } = req.body;
    try {
        let user = await User.findOne({ organizationId });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '2h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login };
