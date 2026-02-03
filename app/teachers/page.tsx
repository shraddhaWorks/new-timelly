import RequireRole from "@/components/RequireRole";
import TeacherSignupPage from "@/components/teachers";

export default function TeachersPortalPage() {
  return (
    <RequireRole allowedRoles={["SCHOOLADMIN"]}>
          <TeacherSignupPage />
    </RequireRole>
  );
}