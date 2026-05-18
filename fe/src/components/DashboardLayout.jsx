import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdMenu, MdClose, MdExitToApp } from "react-icons/md";
import { clearSession, getUserInfo } from "../utils/api";
import "../assets/styles/AuthPages.css";

const DashboardLayout = ({ navItems, defaultView, roleName, children }) => {
  const [selectedItem, setSelectedItem] = useState(defaultView);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const userInfo = getUserInfo();

  const handleLogout = useCallback(() => {
    clearSession();
    navigate("/signin");
  }, [navigate]);

  const handleNavClick = useCallback((label) => {
    setSelectedItem(label);
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const activeItem = navItems.find((item) => item.label === selectedItem);

  return (
    <div className="dashboard">
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <MdClose /> : <MdMenu />}
      </button>

      <div
        className={`sidebar-overlay${sidebarOpen ? " visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`dashboard-sidebar${sidebarOpen ? " open" : ""}`}
        role="navigation"
        aria-label="Dashboard navigation"
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-text">PhotoClick</div>
          <div className="sidebar-brand-role">{roleName}</div>
          {userInfo.name && (
            <div className="sidebar-brand-role" style={{ marginTop: "0.4rem", letterSpacing: 0 }}>
              Hello, {userInfo.name}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`sidebar-link${selectedItem === label ? " active" : ""}`}
              onClick={() => handleNavClick(label)}
              aria-current={selectedItem === label ? "page" : undefined}
            >
              <Icon className="sidebar-icon" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}

          <div className="sidebar-spacer" />

          <div className="sidebar-logout">
            <button className="sidebar-link" onClick={handleLogout}>
              <MdExitToApp className="sidebar-icon" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="dashboard-content" role="main">
        <div className="dashboard-content-inner">
          <h1 className="dashboard-page-title">{selectedItem}</h1>
          {activeItem ? children(selectedItem) : <p>Select an item from the menu.</p>}
        </div>

        <footer className="dashboard-footer" style={{
          textAlign: "center",
          padding: "1.2rem",
          fontSize: "1.2rem",
          color: "var(--color-text-muted)",
        }}>
          &copy; {new Date().getFullYear()} PhotoClick. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
