import ViewMarksPage from "@/components/MarksView";
import RequireRole from "@/components/RequireRole";

export default function MarksViewPages() {
  return (
    <RequireRole allowedRoles={["TEACHER","SCHOOLADMIN"]}>
          <ViewMarksPage />
    </RequireRole>
  );
}