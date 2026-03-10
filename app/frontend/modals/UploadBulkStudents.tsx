
import { useState } from "react";
import { toast } from "../services/toast.service";
import { assignStudentsToClass } from "../services/student.service";
import { PRIMARY_COLOR } from "../constants/colors";

export default function UploadCSVModal({ classId, onClose, onSuccess }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDownloadTemplate = () => {
    // CSV/Excel template matching /api/student/bulk-upload expected columns.
    // Required: name, fatherName, phoneNo (10 digits), aadhaarNo (12 digits), dob (YYYY-MM-DD), totalFee, discountPercent (0-100).
    // Optional: rollNo, gender, previousSchool, class, section, email, address.
    const csvContent = `name,fatherName,rollNo,aadhaarNo,gender,dob,previousSchool,class,section,totalFee,discountPercent,phoneNo,email,address
Rahul Sharma,Rajesh Sharma,STU001,123412341234,Male,2015-06-15,Little Stars School,CSE,A,30000,10,9876543210,parent1@example.com,"123, MG Road, Delhi"
Anita Verma,Sunil Verma,STU002,567856785678,Female,2014-09-20,Happy Kids School,CSE,A,28000,0,9876501234,parent2@example.com,"45, Park Street, Mumbai"`;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
    );
    element.setAttribute("download", "student-bulk-template.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      setLoading(true);

      /* ================= 1.BULK UPLOAD ================= */

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/student/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        toast.error(uploadData.message || "Bulk upload failed");
        return;
      }

      /* ================= 2.FETCH UNASSIGNED STUDENTS (FIX) ================= */

      const studentsRes = await fetch("/api/student/list");
      const studentsData = await studentsRes.json();

      if (!studentsRes.ok || !Array.isArray(studentsData.students)) {
        toast.error("Failed to fetch students");
        return;
      }

      // Filter only unassigned students (file may have assigned some via class/section)
      const unassignedStudents = studentsData.students.filter(
        (student: any) => !student.class
      );

      if (unassignedStudents.length === 0) {
        // All uploaded students were already assigned (e.g. via class/section in file)
        if (uploadData.createdCount > 0) {
          toast.success(
            `${uploadData.createdCount} students added & assigned successfully`
          );
          onSuccess();
          onClose();
        } else {
          toast.error("No unassigned students found");
        }
        return;
      }

      /* ================= 3.ASSIGN TO CLASS ================= */

      for (const student of unassignedStudents) {
        const assignRes = await assignStudentsToClass(
          student.id,
          classId
        );

        const assignData = await assignRes.json();

        if (!assignRes.ok) {
          toast.error(
            assignData.message ||
              `Failed to assign student ${student.user?.name || ""}`
          );
          return;
        }
      }

      /* ================= SUCCESS ================= */

      toast.success(
        `${uploadData.createdCount} students added & assigned successfully`
      );

      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Something went wrong during bulk upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h3 className="font-semibold mb-2">Upload Students CSV / Excel</h3>
        <p className="text-xs text-gray-500 mb-3">
          Required columns: <span className="font-medium">name</span>,{" "}
          <span className="font-medium">fatherName</span>,{" "}
          <span className="font-medium">phoneNo</span>,{" "}
          <span className="font-medium">aadhaarNo</span>,{" "}
          <span className="font-medium">dob</span>. Optional:{" "}
          <span className="font-medium">address</span>,{" "}
          <span className="font-medium">totalFee</span>,{" "}
          <span className="font-medium">discountPercent</span>. DOB format:
          YYYY-MM-DD.
        </p>

        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          />
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="self-start text-xs text-blue-600 hover:underline"
          >
            Download student template
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="border px-4 py-2 rounded border-gray-300">
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={loading}
            style={{ backgroundColor: PRIMARY_COLOR }}
            className="text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
