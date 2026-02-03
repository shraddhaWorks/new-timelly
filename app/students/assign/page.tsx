import RequireRole from "@/components/RequireRole";
import AssignStudentsPage from "@/components/studentsassign";

export default function TeachersPortalPage() {
  return (
    <RequireRole allowedRoles={["SCHOOLADMIN"]}>
          <AssignStudentsPage />
    </RequireRole>
  );
}