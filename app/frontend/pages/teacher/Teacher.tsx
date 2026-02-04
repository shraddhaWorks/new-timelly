"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";


export default function TeacherDashboard() {
  const { data: session } = useSession();
  const tab = useSearchParams().get("tab") ?? "dashboard";

//   const menuItems = TEACHER_MENU_ITEMS.filter(
//     (item:any)=>
//       !item.permission ||
//       session?.user?.allowedFeatures?.includes(item.permission)
//   );

  return (
    // <AppLayout
    //   title={tab.toUpperCase()}
    //   menuItems={menuItems}
    //   profile={{
    //     name: session?.user?.name ?? "Teacher",
    //     subtitle: "Teacher",
    //   }}
    // >
    //   {/* switch(tab) */}
    // </AppLayout>
    <>  </>
  );
}
