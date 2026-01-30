import RequireRole from "@/components/RequireRole";
import AssignStudentsPage from "@/components/studentsassign";

export default function TeachersPortalPage() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL","HOD"]}>
          <AssignStudentsPage />
    </RequireRole>
  );
}