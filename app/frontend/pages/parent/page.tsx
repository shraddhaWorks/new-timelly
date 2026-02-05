import { Suspense } from "react";
import ParentDashboardClient from "../../components/parent/ParentDashboardClient";
import RequiredRoles from "../../auth/RequiredRoles";
import AppLayout from "../../AppLayout";
import { PARENT_MENU_ITEMS } from "../../constants/sidebar";

export default function ParentDashboardPage() {
  return (
  <RequiredRoles allowedRoles={['STUDENT']}> 
  
    <Suspense fallback={<div>Loading...</div>}>
      <ParentDashboardClient />
    </Suspense>
  </RequiredRoles>
  );
}

  // {/* <AppLayout
  //     title={title}
  //     activeTab={tab}
  //     menuItems={PARENT_MENU_ITEMS}
  //     profile={{ name: "Parent", subtitle: "Student Parent" }}
  //     children={<div>{/* TODO: render tab content here based on `tab` */}</div>}
  //   /> */}