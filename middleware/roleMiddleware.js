/**
 * Middleware to check if the user has the required role
 * @param {Array|String} roles - Allowed roles
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'Authorization denied' });
        }

        const { role } = req.user;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(role) && role !== 'Admin') {
            return res.status(403).json({ msg: 'Access denied: insufficient permissions' });
        }

        next();
    };
};

module.exports = checkRole;
