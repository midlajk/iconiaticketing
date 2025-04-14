// utils/authMiddleware.js
module.exports = {
    // Middleware to check if user is authenticated
    requireAuth: (req, res, next) => {
        if (req.session && req.session.user) {
            return next();
        }
        
        // Handle API vs web requests differently
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized: Please login to access this resource'
            });
        }
        
        req.flash('error_msg', 'Please login to access this page');
        return res.redirect('/login');
    },

    // Middleware to check for specific roles
    requireRole: (...roles) => {
        return (req, res, next) => {
            if (!req.session.user) {
                if (req.xhr || req.headers.accept?.includes('application/json')) {
                    return res.status(401).json({ 
                        success: false,
                        message: 'Unauthorized' 
                    });
                }
                req.flash('error_msg', 'Please login to access this page');
                return res.redirect('/login');
            }

            if (!roles.includes(req.session.user.role)) {
                if (req.xhr || req.headers.accept?.includes('application/json')) {
                    return res.status(403).json({ 
                        success: false,
                        message: 'Forbidden: Insufficient permissions' 
                    });
                }
                req.flash('error_msg', 'You do not have permission to access this page');
                return res.redirect('/');
            }

            next();
        };
    },

    // // Middleware to inject user data into request
    // injectUser: (req, res, next) => {
    //     if (req.session.user) {
    //         req.user = req.session.user;
    //     }
    //     next();
    // },

    // // Middleware to ensure guest access only (for login/register pages)
    // requireGuest: (req, res, next) => {
    //     if (req.session.user) {
    //         req.flash('info_msg', 'You are already logged in');
    //         return res.redirect('/dashboard');
    //     }
    //     next();
    // }
};