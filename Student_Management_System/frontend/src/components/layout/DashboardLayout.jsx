import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children }) {
    const storedUser = localStorage.getItem("sms_user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen flex-col bg-[var(--sms-paper)]">
            <Topbar user={user} />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar role={user.role} />

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;