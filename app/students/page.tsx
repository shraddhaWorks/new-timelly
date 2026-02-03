import AddStudentPage from "@/components/addStudents";
import RequireRole from "@/components/RequireRole";

export default function AddStudnetpages() {
  return (
    <RequireRole allowedRoles={["SCHOOLADMIN"]}>
          <AddStudentPage />
    </RequireRole>
  );
}