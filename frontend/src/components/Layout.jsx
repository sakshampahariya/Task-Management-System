import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout({ user, setUser }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar user={user} setUser={setUser} />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
