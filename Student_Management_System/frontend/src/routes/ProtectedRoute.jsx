import { Navigate } from "react-router-dom";

function ProtectedRoute({ allowedRoles, children }) {
    let user = null;

    try {
        const storedUser = localStorage.getItem("sms_user");
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
        localStorage.removeItem("sms_user");
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (!allowedRoles?.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
