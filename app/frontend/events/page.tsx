import WorkshopsAndEventsTab from "../components/schooladmin/workshopsandevents";
import RequiredRoles from "../auth/RequiredRoles";

export default function EventsPages() {
  return (
    <RequiredRoles allowedRoles={["TEACHER", "SCHOOLADMIN"]}>
      <WorkshopsAndEventsTab />
    </RequiredRoles>
  );
}
