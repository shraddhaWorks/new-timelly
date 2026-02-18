import RequiredRoles from "../../frontend/auth/RequiredRoles";
import AddSchool from "../../frontend/components/superadmin/AddSchool";

export default function SchoolSInguppahes() {
  return (
    <RequiredRoles allowedRoles={["SUPERADMIN"]}>
      <AddSchool />
    </RequiredRoles>
  );
}
