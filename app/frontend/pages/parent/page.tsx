import { Suspense } from "react";
import ParentDashboardClient from "../../components/parent/ParentDashboardClient";

export default function ParentDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParentDashboardClient />
    </Suspense>
  );
}
