// "use client";

// import { useEffect } from "react";
// import { X } from "lucide-react";

// interface Props {
//   onClose: () => void;
// }

// const EditTeacher = ({ onClose }: Props) => {
//   useEffect(() => {
//     document.documentElement.style.overflow = "hidden";
//     return () => {
//       document.documentElement.style.overflow = "auto";
//     };
//   }, []);

//   return (
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 ">
//       {/* Backdrop */}
//       <div
//         onClick={onClose}
//         className="absolute inset-0 bg-black/70 backdrop-blur-md"
//       />

//       {/* Modal */}
//       <div className="relative z-10  max-w-6xl max-h-[92vh] rounded-3xl bg-gradient-to-br from-[#0B1B34] to-[#0F172A] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden">

//         {/* Header */}
//         <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
//           <h2 className="text-2xl font-bold text-white">
//             Edit Teacher
//           </h2>

//           <button
//             onClick={onClose}
//             className="p-2 rounded-lg hover:bg-white/5 transition"
//           >
//             <X className="w-5 h-5 text-gray-400" />
//           </button>
//         </div>

//         {/* Scrollable Body */}
//         <div className="flex-1 overflow-y-auto px-8 py-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

//             {/* Teacher Name */}
//             <Input label="Teacher Name" defaultValue="Mrs. Priya Sharma" />

//             {/* Teacher ID */}
//             <Input label="Teacher ID" defaultValue="TCH001" />

//             {/* Subject */}
//             <Input label="Subject" defaultValue="Mathematics" />

//             {/* Classes */}
//             <Input label="Classes" defaultValue="10-A, 10-B" />

//             {/* Phone */}
//             <Input label="Phone" defaultValue="+91 98765 43210" />

//             {/* Email */}
//             <Input label="Email" defaultValue="priya.sharma@school.com" />

//             {/* Qualification */}
//             <Input label="Qualification" defaultValue="M.Sc Mathematics, B.Ed" />

//             {/* Experience */}
//             <Input label="Experience" defaultValue="8 years" />

//             {/* Joining Date */}
//             <div>
//               <label className="text-sm text-gray-400">
//                 Joining Date
//               </label>
//               <input
//                 type="date"
//                 defaultValue="2018-06-15"
//                 className="mt-2 w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 outline-none transition"
//               />
//             </div>

//             {/* Status */}
//             <div>
//               <label className="text-sm text-gray-400">
//                 Status
//               </label>
//               <select
//                 defaultValue="Active"
//                 className="mt-2 w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 outline-none transition"
//               >
//                 <option value="Active">Active</option>
//                 <option value="On Leave">On Leave</option>
//                 <option value="Inactive">Inactive</option>
//               </select>
//             </div>

//           </div>

//           {/* Address - Full Width */}
//           <div className="mt-8">
//             <label className="text-sm text-gray-400">
//               Address
//             </label>
//             <textarea
//               rows={4}
//               className="mt-2 w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 outline-none transition resize-none"
//               placeholder="Enter address..."
//             />
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-8 py-6 border-t border-white/10 flex justify-end gap-4 bg-[#0F172A]">
//           <button
//             onClick={onClose}
//             className="px-6 py-3 rounded-2xl bg-white/5 text-gray-300 hover:bg-white/10 transition"
//           >
//             Cancel
//           </button>

//           <button className="px-8 py-3 rounded-2xl bg-lime-400 text-black font-semibold hover:bg-lime-300 transition shadow-lg shadow-lime-400/30">
//             Save Changes
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default EditTeacher;

// /* Reusable Input Component */
// const Input = ({
//   label,
//   defaultValue,
// }: {
//   label: string;
//   defaultValue?: string;
// }) => (
//   <div>
//     <label className="text-sm text-gray-400">
//       {label}
//     </label>
//     <input
//       defaultValue={defaultValue}
//       className="mt-2 w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 outline-none transition"
//     />
//   </div>
// );


"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { TeacherRow } from "./TeachersList";

interface Props {
  teacher: TeacherRow;
  onClose: () => void;
  onSave: (updatedTeacher: TeacherRow) => void;
}

const EditTeacher = ({ teacher, onClose, onSave }: Props) => {
  const [formData, setFormData] = useState<TeacherRow>(teacher);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    setFormData(teacher);
  }, [teacher]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value } as TeacherRow));
  };

  const handleSave = () => {
    onSave(formData);   // send updated data to parent
    onClose();          // close modal
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Modal */}
      <div className="relative z-10 max-w-6xl max-h-[92vh] rounded-3xl bg-gradient-to-br from-[#0B1B34] to-[#0F172A] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Edit Teacher</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Teacher Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <Input
              label="Teacher Code"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
            />

            <Input
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
            />

            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="Avatar URL"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/10 flex justify-end gap-4 bg-[#0F172A]">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-white/5 text-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-2xl bg-lime-400 text-black font-semibold"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditTeacher;

/* Reusable Input */
const Input = ({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label className="text-sm text-gray-400">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      className="mt-2 w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white"
    />
  </div>
);
