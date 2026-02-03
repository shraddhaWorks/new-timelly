import ClassesPage from "@/components/Classes";
import RequireRole from "@/components/RequireRole";

export default function ClassesPages() {
  return (
    <RequireRole allowedRoles={["SCHOOLADMIN"]}>
          <ClassesPage />
    </RequireRole>
  );
}