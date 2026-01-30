import HodPortalPage from "@/components/hodPortal";
import RequireRole from "@/components/RequireRole";

export default function HodPages() {
  return (
    <RequireRole allowedRoles={["HOD"]}>
          <HodPortalPage />
    </RequireRole>
  );
}