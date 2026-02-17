"use client";

import { useEffect, useState } from "react";
import PageHeader from "../common/PageHeader";
import FeeStatCards from "./fees/FeeStatCards";
import OfflinePaymentForm from "./fees/OfflinePaymentForm";
import AddExtraFeeForm from "./fees/AddExtraFeeForm";
import FeeStructureConfig from "./fees/FeeStructureConfig";
import FeeRecordsTable from "./fees/FeeRecordsTable";
import type { Class, Student, FeeSummary, FeeRecord, FeeStructure } from "./fees/types";
import Spinner from "../common/Spinner";

export default function FeesTab() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [stats, setStats] = useState<FeeSummary | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, clsRes, stuRes, structRes] = await Promise.all([
        fetch("/api/fees/summary"),
        fetch("/api/class/list"),
        fetch("/api/student/list"),
        fetch("/api/fees/structure"),
      ]);
      const [sumData, clsData, stuData, structData] = await Promise.all([
        sumRes.json(),
        clsRes.json(),
        stuRes.json(),
        structRes.json(),
      ]);

      if (sumRes.ok) {
        setFees(sumData.fees || []);
        setStats(sumData.stats || null);
      }
      if (clsRes.ok) setClasses(clsData.classes || []);
      if (stuRes.ok) setStudents(stuData.students || []);
      if (structRes.ok) setStructures(structData.structures || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Spinner/>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Fees Management"
          subtitle="Track and manage student fee payments with detailed breakdowns"
        />

        <FeeStatCards stats={stats} />

        <div className="grid md:grid-cols-2 gap-6">
          <OfflinePaymentForm students={students} onSuccess={fetchData} />
          <AddExtraFeeForm classes={classes} students={students} onSuccess={fetchData} />
        </div>

        <FeeStructureConfig
          classes={classes}
          structures={structures}
          onSuccess={fetchData}
        />

        <FeeRecordsTable fees={fees} classes={classes} />
      </div>
    </div>
  );
}
