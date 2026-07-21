import { useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    return (
        <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[var(--sms-page)]">
            <Topbar user={user} onMenuClick={() => setIsMenuOpen(true)} />

            <div className="flex min-h-0 flex-1 overflow-hidden">
                <Sidebar
                    role={user.role}
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                />

                <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:p-8">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
