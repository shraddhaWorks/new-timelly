import RequireRole from "@/components/RequireRole";
import TCPage from "@/components/tc";

export default function TCpages() {
  return (
    <RequireRole allowedRoles={["SCHOOLADMIN"]}>
          <TCPage />
    </RequireRole>
  );
}