import PrincipalPortalPage from "@/components/principalPortal";
import RequireRole from "@/components/RequireRole";

export default function PrincipalPages() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
          <PrincipalPortalPage />
    </RequireRole>
  );
}