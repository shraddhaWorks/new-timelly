import AddStudentPage from "@/components/addStudents";
import RequireRole from "@/components/RequireRole";

export default function AddStudnetpages() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL","HOD"]}>
          <AddStudentPage />
    </RequireRole>
  );
}