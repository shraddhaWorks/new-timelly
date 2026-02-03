import MarkAttendancePage from "@/components/AtendMark";
import RequireRole from "@/components/RequireRole";

export default function AttendanceMarkPage() {
  return (
    <RequireRole allowedRoles={["TEACHER","SCHOOLADMIN"]}>
          <MarkAttendancePage />
    </RequireRole>
  );
}