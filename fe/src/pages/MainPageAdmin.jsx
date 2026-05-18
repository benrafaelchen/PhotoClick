import React from "react";
import { CgProfile } from "react-icons/cg";
import { MdList, MdPhoto, MdInfo, MdHelp, MdAssignment, MdReport } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import FAQ from "../components/FAQ";
import AboutUs from "../components/AboutUs";
import Gallery from "../components/Gallery";
import Profile from "../components/Profile";
import OrdersEvents from "../components/OrdersEvents";
import DisplayWorkers from "../components/DisplayWorkers";
import Reports from "../components/Reports";

const navItems = [
  { label: "Orders & Events", icon: MdList },
  { label: "Team & Clients", icon: MdAssignment },
  { label: "Reports", icon: MdReport },
  { label: "Profile", icon: CgProfile },
  { label: "Gallery", icon: MdPhoto },
  { label: "About Us", icon: MdInfo },
  { label: "FAQ", icon: MdHelp },
];

const MainPageAdmin = () => {
  const renderContent = (selected) => {
    switch (selected) {
      case "Orders & Events": return <OrdersEvents isAdmin={true} />;
      case "Team & Clients": return <DisplayWorkers />;
      case "Reports": return <Reports />;
      case "Profile": return <Profile />;
      case "Gallery": return <Gallery isAdmin={true} />;
      case "About Us": return <AboutUs isAdmin={true} />;
      case "FAQ": return <FAQ isAdmin={true} />;
      default: return null;
    }
  };

  return (
    <DashboardLayout navItems={navItems} defaultView="Orders & Events" roleName="Admin">
      {renderContent}
    </DashboardLayout>
  );
};

export default MainPageAdmin;
