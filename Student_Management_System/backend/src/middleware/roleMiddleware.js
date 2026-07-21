

// const allowRoles = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Access denied. You do not have permission",
//             });
//         }

//         next();

//     };
// };


// module.exports = allowRoles;


export function allowRoles(...allowedRoles) {
    return function (req, res, next) {
        const userRole = req.user?.role?.toLowerCase();

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You do not have permission.",
            });
        }

        next();
    };
}