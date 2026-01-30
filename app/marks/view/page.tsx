import ViewMarksPage from "@/components/MarksView";
import RequireRole from "@/components/RequireRole";

export default function MarksViewPages() {
  return (
    <RequireRole allowedRoles={["TEACHER","HOD"]}>
          <ViewMarksPage />
    </RequireRole>
  );
}