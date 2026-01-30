import ViewAttendancePage from "@/components/attendenceView";
import RequireRole from "@/components/RequireRole";

export default function ViewAttendancePages() {
  return (
    <RequireRole allowedRoles={["TEACHER","HOD"]}>
          <ViewAttendancePage />
    </RequireRole>
  );
}