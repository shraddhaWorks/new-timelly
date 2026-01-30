import EventsPage from "@/components/Events";
import RequireRole from "@/components/RequireRole";

export default function EventsPages() {
  return (
    <RequireRole allowedRoles={["TEACHER","SCHOOLADMIN","PRINCIPAL","HOD"]}>
          <EventsPage />
    </RequireRole>
  );
}