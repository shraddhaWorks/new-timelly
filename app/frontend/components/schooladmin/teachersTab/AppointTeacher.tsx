// "use client";

// import { GraduationCap, UserPlus, Pencil, Trash2 } from "lucide-react";
// import { useState } from "react";

// /* ================= Types ================= */
// type AppointmentRow = {
//   id: string;
//   className: string;
//   teacherName: string;
//   teacherCode: string;
//   teacherEmail: string;
//   avatar: string;
// };

// /* ================= Sample Data ================= */
// const initialData: AppointmentRow[] = [
//   {
//     id: "1",
//     className: "10-A",
//     teacherName: "Mrs. Priya Sharma",
//     teacherCode: "TCH001",
//     teacherEmail: "priya.sharma@school.com",
//     avatar: "https://i.pravatar.cc/40?img=32",
//   },
//   {
//     id: "2",
//     className: "9-A",
//     teacherName: "Mr. Rajesh Kumar",
//     teacherCode: "TCH002",
//     teacherEmail: "rajesh.kumar@school.com",
//     avatar: "https://i.pravatar.cc/40?img=12",
//   },
// ];

// /* ================= Component ================= */
// export default function AppointTeacher() {
//   const [data, setData] = useState<AppointmentRow[]>(initialData);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedTeacher, setSelectedTeacher] = useState("");

//   const handleDelete = (id: string) => {
//     setData((prev) => prev.filter((item) => item.id !== id));
//   };

//   const handleAssign = () => {
//     if (!selectedClass || !selectedTeacher) return;

//     const newRow: AppointmentRow = {
//       id: Date.now().toString(),
//       className: selectedClass,
//       teacherName: selectedTeacher,
//       teacherCode: `TCH${data.length + 3}`,
//       teacherEmail: `${selectedTeacher
//         .toLowerCase()
//         .replace(/\s/g, ".")}@school.com`,
//       avatar: "https://i.pravatar.cc/40?img=50",
//     };

//     setData((prev) => [...prev, newRow]);
//     setSelectedClass("");
//     setSelectedTeacher("");
//   };

//   return (
//     <div className="space-y-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white">
//       {/* ================= HEADER ================= */}
//       <div className="p-4 sm:p-6">
//         <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
//           <GraduationCap className="text-lime-400" />
//           Appoint Class Teacher
//         </h2>
//         <p className="text-xs sm:text-sm text-white/60 mt-1">
//           Assign one class teacher per class.
//         </p>
//       </div>

//       {/* ================= FORM ================= */}
//       <div className="border-y border-white/10 p-4 sm:p-6 bg-[#0F172A]/50">
//         <div className="flex flex-col md:flex-row gap-4">
//           <select
//             value={selectedClass}
//             onChange={(e) => setSelectedClass(e.target.value)}
//             className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
//           >
//             <option value="">-- Select Class --</option>
//             {["9-A", "10-A", "11-B"].map((cls) => (
//               <option key={cls} value={cls} className="bg-[#0F172A]">
//                 {cls}
//               </option>
//             ))}
//           </select>

//           <select
//             value={selectedTeacher}
//             onChange={(e) => setSelectedTeacher(e.target.value)}
//             className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
//           >
//             <option value="">-- Select Teacher --</option>
//             {["Mr. Rajesh Kumar", "Mrs. Priya Sharma"].map((t) => (
//               <option key={t} value={t} className="bg-[#0F172A]">
//                 {t}
//               </option>
//             ))}
//           </select>

//           <button
//             disabled={!selectedClass || !selectedTeacher}
//             onClick={handleAssign}
//             className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 justify-center transition ${!selectedClass || !selectedTeacher
//                 ? "bg-white/10 text-white/40 cursor-not-allowed"
//                 : "bg-lime-500 text-black hover:bg-lime-400"
//               }`}
//           >
//             <UserPlus size={18} />
//             Assign
//           </button>
//         </div>
//       </div>

//       {/* ================= CURRENT APPOINTMENTS ================= */}
//       {/* ===== CURRENT APPOINTMENTS ===== */}
//       <div className="p-4 sm:p-6">
//         <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase">
//           Current Appointments
//         </h3>

//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[560px] text-left">
//             {/* ===== TABLE HEAD ===== */}
//             <thead className="bg-white/5 rounded-lg">
//               <tr className="text-xs text-gray-400 uppercase">
//                 <th className="px-3 py-2">Class</th>
//                 <th className="px-3 py-2">Class Teacher</th>
//                 <th className="px-3 py-2 hidden sm:table-cell">
//                   Teacher Email
//                 </th>
//                 <th className="px-3 py-2 text-right">Actions</th>
//               </tr>
//             </thead>

//             {/* ===== TABLE BODY ===== */}
//             <tbody>
//               {data.map((item) => (
//                 <tr
//                   key={item.id}
//                   className="hover:bg-white/5 transition-colors"
//                 >
//                   {/* CLASS */}
//                   <td className="px-3 py-3">
//                     <span className="px-2 py-1 text-xs font-bold rounded-md bg-white/10 text-lime-400">
//                       {item.className}
//                     </span>
//                   </td>

//                   {/* TEACHER */}
//                   <td className="px-3 py-3">
//                     <div className="flex items-center gap-2 min-w-[160px]">
//                       <img
//                         src={item.avatar}
//                         alt={item.teacherName}
//                         className="w-7 h-7 rounded-full border border-white/10"
//                       />
//                       <div className="leading-tight">
//                         <p className="text-sm font-medium text-white truncate max-w-[120px]">
//                           {item.teacherName}
//                         </p>
//                         <p className="text-[10px] text-white/40 uppercase">
//                           {item.teacherCode}
//                         </p>
//                       </div>
//                     </div>
//                   </td>

//                   {/* EMAIL */}
//                   <td className="px-3 py-3 text-sm text-white/50 hidden sm:table-cell break-all">
//                     {item.teacherEmail}
//                   </td>

//                   {/* ACTIONS */}
//                   <td className="px-3 py-3 text-right">
//                     <div className="flex justify-end gap-2">
//                       <Pencil
//                         size={14}
//                         className="text-lime-400 cursor-pointer hover:opacity-80"
//                       />
//                       <Trash2
//                         size={14}
//                         className="text-red-400 cursor-pointer hover:opacity-80"
//                         onClick={() =>
//                           setData((prev) =>
//                             prev.filter((row) => row.id !== item.id)
//                           )
//                         }
//                       />
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//       </div>

//     </div>
//   );
// }



"use client";

import { GraduationCap, UserPlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

/* ================= TYPES ================= */
type AppointmentRow = {
  id: string;
  className: string;
  teacherName: string;
  teacherCode: string;
  teacherEmail: string;
  avatar: string;
};

type TableColumn<T> = {
  key: keyof T | "actions";
  label: string;
  hideOnMobile?: boolean;
  className?: string;
};

/* ================= COLUMN CONFIG ================= */
const columns: TableColumn<AppointmentRow>[] = [
  { key: "className", label: "Class" },
  { key: "teacherName", label: "Class Teacher" },
  {
    key: "teacherEmail",
    label: "Teacher Email",
    hideOnMobile: true,
  },
  { key: "actions", label: "Actions", className: "text-right" },
];

/* ================= SAMPLE DATA ================= */
const initialData: AppointmentRow[] = [
  {
    id: "1",
    className: "10-A",
    teacherName: "Mrs. Priya Sharma",
    teacherCode: "TCH001",
    teacherEmail: "priya.sharma@school.com",
    avatar: "https://i.pravatar.cc/40?img=32",
  },
  {
    id: "2",
    className: "9-A",
    teacherName: "Mr. Rajesh Kumar",
    teacherCode: "TCH002",
    teacherEmail: "rajesh.kumar@school.com",
    avatar: "https://i.pravatar.cc/40?img=12",
  },
];

/* ================= COMPONENT ================= */
export default function AppointTeacher() {
  const [data, setData] = useState<AppointmentRow[]>(initialData);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAssign = () => {
    if (!selectedClass || !selectedTeacher) return;

    const newRow: AppointmentRow = {
      id: Date.now().toString(),
      className: selectedClass,
      teacherName: selectedTeacher,
      teacherCode: `TCH${data.length + 3}`,
      teacherEmail: `${selectedTeacher
        .toLowerCase()
        .replace(/\s/g, ".")}@school.com`,
      avatar: "https://i.pravatar.cc/40?img=50",
    };

    setData((prev) => [...prev, newRow]);
    setSelectedClass("");
    setSelectedTeacher("");
  };

  return (
    <div className="space-y-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white">
      {/* ================= HEADER ================= */}
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <GraduationCap className="text-lime-400" />
          Appoint Class Teacher
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mt-1">
          Assign one class teacher per class.
        </p>
      </div>

      {/* ================= FORM ================= */}
      <div className="border-y border-white/10 p-4 sm:p-6 bg-[#0F172A]/50">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
          >
            <option value="">-- Select Class --</option>
            {["9-A", "10-A", "11-B"].map((cls) => (
              <option key={cls} value={cls} className="bg-[#0F172A]">
                {cls}
              </option>
            ))}
          </select>

          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
          >
            <option value="">-- Select Teacher --</option>
            {["Mr. Rajesh Kumar", "Mrs. Priya Sharma"].map((t) => (
              <option key={t} value={t} className="bg-[#0F172A]">
                {t}
              </option>
            ))}
          </select>

          <button
            disabled={!selectedClass || !selectedTeacher}
            onClick={handleAssign}
            className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 justify-center transition ${
              !selectedClass || !selectedTeacher
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-lime-500 text-black hover:bg-lime-400"
            }`}
          >
            <UserPlus size={18} />
            Assign
          </button>
        </div>
      </div>

      {/* ================= CURRENT APPOINTMENTS ================= */}
      <div className="p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase">
          Current Appointments
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            {/* ===== TABLE HEAD ===== */}
            <thead className="bg-white/5">
              <tr className="text-xs text-gray-400 uppercase">
                {columns.map((col, index) => (
                  <th
                    key={col.key}
                    className={`px-3 py-2 ${
                      col.hideOnMobile ? "hidden sm:table-cell" : ""
                    } ${index === 0 ? "rounded-l-lg" : ""} ${
                      index === columns.length - 1 ? "rounded-r-lg" : ""
                    } ${col.className || ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ===== TABLE BODY ===== */}
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-6 text-center text-sm text-white/40"
                  >
                    No appointments found
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {columns.map((col) => {
                      if (col.key === "actions") {
                        return (
                          <td
                            key="actions"
                            className="px-3 py-3 text-right"
                          >
                            <div className="flex justify-end gap-2">
                              <Pencil
                                size={14}
                                className="text-lime-400 cursor-pointer hover:opacity-80"
                              />
                              <Trash2
                                size={14}
                                className="text-red-400 cursor-pointer hover:opacity-80"
                                onClick={() => handleDelete(item.id)}
                              />
                            </div>
                          </td>
                        );
                      }

                      if (col.key === "className") {
                        return (
                          <td key={col.key} className="px-3 py-3">
                            <span className="px-2 py-1 text-xs font-bold rounded-md bg-white/10 text-lime-400">
                              {item.className}
                            </span>
                          </td>
                        );
                      }

                      if (col.key === "teacherName") {
                        return (
                          <td key={col.key} className="px-3 py-3">
                            <div className="flex items-center gap-2 min-w-[160px]">
                              <img
                                src={item.avatar}
                                alt={item.teacherName}
                                className="w-7 h-7 rounded-full border border-white/10"
                              />
                              <div className="leading-tight">
                                <p className="text-sm font-medium text-white truncate max-w-[120px]">
                                  {item.teacherName}
                                </p>
                                <p className="text-[10px] text-white/40 uppercase">
                                  {item.teacherCode}
                                </p>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.key}
                          className={`px-3 py-3 text-sm text-white/50 ${
                            col.hideOnMobile
                              ? "hidden sm:table-cell"
                              : ""
                          }`}
                        >
                          {item[col.key]}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

