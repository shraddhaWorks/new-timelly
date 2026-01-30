import MarksEntryPage from "@/components/MarksEntry";
import RequireRole from "@/components/RequireRole";

export default function MarksEntryPages() {
  return (
    <RequireRole allowedRoles={["TEACHER","HOD"]}>
          <MarksEntryPage />
    </RequireRole>
  );
}