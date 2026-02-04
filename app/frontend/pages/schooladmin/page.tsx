"use client";

import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { SCHOOLADMIN_MENU_ITEMS, SCHOOLADMIN_TAB_TITLES } from "../../constants/sidebar";
import RequiredRoles from "../../auth/RequiredRoles";
import SchoolAdminStudentsTab from "../../components/schooladmin/Students";
import SchoolAdminAddUserTab from "../../components/schooladmin/AddUser";
import SchoolAdminClassesTab from "../../components/schooladmin/Classes";
import SchoolAdminDashboard from "../../components/schooladmin/Dashboard";
import SchoolTeacherLeavesTab from "../../components/schooladmin/TeacherLeaves";
import SchoolCercularsTab from "../../components/schooladmin/circulars";

export default function SchoolAdmin() {
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = SCHOOLADMIN_TAB_TITLES[tab] ?? tab.toUpperCase();
  const renderComponent = () => {
    switch (tab) {
      case "dashboard":
        return <SchoolAdminDashboard/>;
      case "students":
        return <SchoolAdminStudentsTab/>;
      case "add-user":
        return <SchoolAdminAddUserTab/>;
      case "classes":
        return <SchoolAdminClassesTab/>;
      case "student-details":
        return;
      case "teachers":
        return;
      case "teacher-leaves":
        return <SchoolTeacherLeavesTab/>;
      case "teacher-audit":
        return;
      case "workshops":
        return;
      case "Newsfeed":
        return;
      case "certificates":
        return;
      case "exams":
        return;
      case "analysis":
        return;
      case "fees":
        return;
      case "settings":
        return;
      case "circulars":
        return <SchoolCercularsTab/>;
      default:
        return <div>Not found</div>;
    }
  }

  return (
  <RequiredRoles allowedRoles={['SCHOOLADMIN']}> 
    <AppLayout
      title={title}
      menuItems={SCHOOLADMIN_MENU_ITEMS}
      profile={{ name: "School Admin" }}
      children={renderComponent()}
    />
  </RequiredRoles>
  );
}
