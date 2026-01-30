"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BookOpen, RotateCcw, AlertCircle, Save } from "lucide-react";

/* ================= TYPES ================= */

interface Class {
  id: string;
  name: string;
  section?: string | null;
}

interface Student {
  id: string;
  name?: string | null;
  rollNo?: string | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

interface LibraryIssue {
  id: string;
  bookName: string;
  bookNumber?: string | null;
  issueDate: string;
  expectedDate: string;
  finePerDay: number;
  overdueDays: number;
  fineAmount: number;
  returnDate?: string | null;
  status: "ISSUED" | "RETURNED" | "OVERDUE";
  student?: Student | null;
}

/* ================= PAGE ================= */

export default function LibraryIssuePage() {
  const { data: session, status } = useSession();

  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [issues, setIssues] = useState<LibraryIssue[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const [bookName, setBookName] = useState("");
  const [bookNumber, setBookNumber] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [overdueDays, setOverdueDays] = useState<number>(0);
  const [finePerDay, setFinePerDay] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH CLASSES ================= */

  useEffect(() => {
    if (!session || session.user.role !== "TEACHER") return;

    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/class/list");
        const data = await res.json();
        setClasses(data.classes || []);
      } catch (err) {
        console.error(err);
        setMessage("Error fetching classes");
      }
    };

    fetchClasses();
  }, [session]);

  /* ================= FETCH STUDENTS ================= */

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setSelectedStudent("");
      return;
    }

    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `/api/class/students?classId=${selectedClass}`
        );
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error(err);
        setMessage("Error fetching students");
      }
    };

    fetchStudents();
  }, [selectedClass]);

  /* ================= FETCH ISSUED BOOKS ================= */

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/library/issued");
      const data = await res.json();
      setIssues(data || []);
    } catch (err) {
      console.error(err);
      setMessage("Error fetching issued books");
    }
  };

  useEffect(() => {
    if (session?.user.role === "TEACHER") fetchIssues();
  }, [session]);

  /* ================= ISSUE BOOK ================= */

  const issueBook = async () => {
    if (!bookName || !selectedStudent || !expectedDate) {
      setMessage("Please fill all required fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/library/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookName,
          bookNumber: bookNumber || null,
          studentId: selectedStudent,
          expectedDate,
          finePerDay,
        }),
      });

      if (!res.ok) throw new Error();

      setBookName("");
      setBookNumber("");
      setExpectedDate("");
      setFinePerDay(0);
      setSelectedClass("");
      setSelectedStudent("");
      setStudents([]);

      fetchIssues();
      setMessage("Book issued successfully");
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RETURN BOOK ================= */

  const returnBook = async (id: string) => {
    await fetch("/api/library/return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId: id }),
    });

    fetchIssues();
  };

  /* ================= GUARDS ================= */

  if (status === "loading")
    return <p className="text-white p-6">Loading...</p>;

  if (!session || session.user.role !== "TEACHER")
    return <p className="text-red-400 p-6">Forbidden</p>;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <BookOpen /> Library – Issue Books
        </h1>

        {message && (
          <div className="p-4 bg-[#1a1a1a] border border-[#333] rounded text-white flex gap-2">
            <AlertCircle size={18} /> {message}
          </div>
        )}

        {/* ISSUE FORM */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 space-y-4">
          <input
            placeholder="Book Name *"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            className="w-full bg-[#2d2d2d] p-2 rounded text-white"
          />

          <input
            placeholder="Book Number (optional)"
            value={bookNumber}
            onChange={(e) => setBookNumber(e.target.value)}
            className="w-full bg-[#2d2d2d] p-2 rounded text-white"
          />

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-[#2d2d2d] p-2 rounded text-white"
          >
            <option value="">Select Class *</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.section ? `- ${c.section}` : ""}
              </option>
            ))}
          </select>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            disabled={!selectedClass}
            className="w-full bg-[#2d2d2d] p-2 rounded text-white disabled:opacity-50"
          >
            <option value="">Select Student *</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.user?.name ?? s.name ?? "Unknown"}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            className="w-full bg-[#2d2d2d] p-2 rounded text-white"
          />

          <input
            type="number"
            placeholder="Fine per day (₹)"
            value={finePerDay}
            onChange={(e) => setFinePerDay(Number(e.target.value))}
            className="w-full bg-[#2d2d2d] p-2 rounded text-white"
          />

          <button
            onClick={issueBook}
            disabled={loading}
            className="bg-[#404040] hover:bg-[#6b6b6b] px-4 py-2 rounded flex items-center gap-2 text-white"
          >
            <Save size={18} /> {loading ? "Issuing..." : "Issue Book"}
          </button>
        </div>

        {/* ISSUED LIST */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
          {issues.map((i) => (
            <div
              key={i.id}
              className="bg-[#2d2d2d] p-4 rounded flex justify-between items-center mb-3"
            >
              <div>
                <p className="text-white font-semibold">{i.bookName}</p>
                <p className="text-sm text-[#808080]">
                  Student:{" "}
                  {i.student?.user?.name ??
                    i.student?.name ??
                    "Unknown"}
                </p>
                <p className="text-sm text-[#808080]">
                  Issued:{" "}
                  {new Date(i.issueDate).toLocaleDateString()} | Expected:{" "}
                  {new Date(i.expectedDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-red-400">
                  Overdue: {i.overdueDays} days | Fine: ₹{i.fineAmount}
                </p>

                {i.returnDate && (
                  <p className="text-sm text-green-400">
                    Returned:{" "}
                    {new Date(i.returnDate).toLocaleDateString()}
                  </p>
                )}

                <p className="text-sm font-bold text-yellow-400">
                  {i.status}
                </p>
              </div>

              {i.status === "ISSUED" && (
                <button
                  onClick={() => returnBook(i.id)}
                  className="text-green-400 flex items-center gap-1"
                >
                  <RotateCcw size={16} /> Return
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
