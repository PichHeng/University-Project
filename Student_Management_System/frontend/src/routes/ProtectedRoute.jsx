// import { Navigate } from "react-router-dom";

// function ProtectedRoute({ allowedRoles, children }) {
//     let user = null;

//     try {
//         const storedUser = localStorage.getItem("sms_user");
//         user = storedUser ? JSON.parse(storedUser) : null;
//     } catch {
//         localStorage.removeItem("sms_user");
//     }

//     if (!user) {
//         return <Navigate to="/login" replace />;
//     }
//     if (!allowedRoles?.includes(user.role)) {
//         return <Navigate to="/login" replace />;
//     }

//     return children;
// }

// export default ProtectedRoute;


import { Navigate } from "react-router-dom";

function ProtectedRoute({ allowedRoles, children }) {
    const token = localStorage.getItem("sms_token");
    const storedUser = localStorage.getItem("sms_user");

    let user;
    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
        localStorage.removeItem("sms_token");
        localStorage.removeItem("sms_user");
        return <Navigate to="/login" replace />;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role?.toLowerCase();

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
