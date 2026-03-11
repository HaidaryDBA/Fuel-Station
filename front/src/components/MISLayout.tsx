import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import MISHeader from "./MISHeader";
import { SessionTimeoutModal } from "@/modules/auth";
import { useSessionTimeout } from "@/modules/auth";
import { useSessionStore } from "@/modules/auth";

export default function MISLayout() {
  const { keepAlive, remainingTime } = useSessionTimeout();
  const { showTimeoutWarning, hideWarning } = useSessionStore();

  return (
    <div data-section="mis" className="flex h-screen bg-background">
      {/* Main Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <MISHeader />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>

      {/* Session Timeout Modal */}
      <SessionTimeoutModal
        isOpen={showTimeoutWarning}
        remainingSeconds={Math.floor(remainingTime / 1000)}
        onKeepAlive={() => {
          keepAlive();
          hideWarning();
        }}
      />
    </div>
  );
}
