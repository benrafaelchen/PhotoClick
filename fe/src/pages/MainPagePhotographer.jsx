import React from "react";
import { CgProfile } from "react-icons/cg";
import { MdCalendarToday, MdPhoto, MdInfo, MdHelp } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import FAQ from "../components/FAQ";
import AboutUs from "../components/AboutUs";
import Gallery from "../components/Gallery";
import Profile from "../components/Profile";
import Events from "../components/Events";

const navItems = [
  { label: "My Assignments", icon: MdCalendarToday },
  { label: "Profile", icon: CgProfile },
  { label: "Gallery", icon: MdPhoto },
  { label: "About Us", icon: MdInfo },
  { label: "FAQ", icon: MdHelp },
];

const MainPagePhotographer = () => {
  const renderContent = (selected) => {
    switch (selected) {
      case "My Assignments": return <Events />;
      case "Profile": return <Profile />;
      case "Gallery": return <Gallery isAdmin={false} />;
      case "About Us": return <AboutUs isAdmin={false} />;
      case "FAQ": return <FAQ isAdmin={false} />;
      default: return null;
    }
  };

  return (
    <DashboardLayout navItems={navItems} defaultView="My Assignments" roleName="Photographer">
      {renderContent}
    </DashboardLayout>
  );
};

export default MainPagePhotographer;
