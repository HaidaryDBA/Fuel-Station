import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function AppLayout() {
  return (
    <main>
      <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    </main>
  );
}

export default AppLayout;
