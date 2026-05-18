import React from "react";
import { CgProfile } from "react-icons/cg";
import { MdAddCircleOutline, MdList, MdPhoto, MdInfo, MdHelp } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import FAQ from "../components/FAQ";
import AboutUs from "../components/AboutUs";
import Gallery from "../components/Gallery";
import CreateNewOrder from "../components/CreateNewOrder";
import Profile from "../components/Profile";
import MyOrders from "../components/MyOrders";

const navItems = [
  { label: "New Booking", icon: MdAddCircleOutline },
  { label: "My Orders", icon: MdList },
  { label: "Profile", icon: CgProfile },
  { label: "Gallery", icon: MdPhoto },
  { label: "About Us", icon: MdInfo },
  { label: "FAQ", icon: MdHelp },
];

const MainPageCustomer = () => {
  const renderContent = (selected) => {
    switch (selected) {
      case "New Booking": return <CreateNewOrder />;
      case "My Orders": return <MyOrders />;
      case "Profile": return <Profile />;
      case "Gallery": return <Gallery isAdmin={false} />;
      case "About Us": return <AboutUs isAdmin={false} />;
      case "FAQ": return <FAQ isAdmin={false} />;
      default: return null;
    }
  };

  return (
    <DashboardLayout navItems={navItems} defaultView="New Booking" roleName="Customer">
      {renderContent}
    </DashboardLayout>
  );
};

export default MainPageCustomer;
