import AddStudentPage from "@/components/addStudents";
import RequireRole from "@/components/RequireRole";
import StudentTable from "@/app/frontend/components/schooladmin/schooladmincomponents/StudentTable";

export default function AddStudnetpages() {
  return (
    <RequireRole allowedRoles={["SCHOOLADMIN"]}>
      <div className="space-y-8 p-4">
        <StudentTable />
        <AddStudentPage />
      </div>
    </RequireRole>
  );
}