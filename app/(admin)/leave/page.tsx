import AdminLeavesPage from "@/components/adminleave";
import RequireRole from "@/components/RequireRole";

export default function AdminLeavesPages() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL","HOD"]}>
          <AdminLeavesPage />
    </RequireRole>
  );
}