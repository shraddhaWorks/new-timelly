import { Users } from "lucide-react";

interface StudentProfileProps {
  name: string;
  id: string;
  className: string;
  rollNo: string;
  age: string;
  email: string;
  phone: string;
  address: string;
}

type Props = {
  student: StudentProfileProps;
  fatherName?: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  motherName?: string;
  motherOccupation?: string;
};

export const ProfileSidebar = ({
  student,
  fatherName = "",
  fatherOccupation = "",
  fatherPhone = "",
  motherName = "",
  motherOccupation = "",
}: Props) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-2xl p-4 sm:p-6 text-center">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4">
        <img
          src="/avatar.jpg"
          className="rounded-2xl border-2 border-lime-400 object-cover w-full h-full"
          alt={student.name}
        />
        <span className="absolute -bottom-2 -right-2 bg-lime-400 text-black p-1 rounded-lg">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
        </span>
      </div>
      <h3 className="text-lg sm:text-xl font-bold truncate px-2">{student.name}</h3>
      <p className="text-lime-400 text-sm font-mono">{student.id}</p>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-4 sm:mt-6">
        <div className="bg-white/5 p-2 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase">Class</p>
          <p className="text-sm font-bold">{student.className}</p>
        </div>
        <div className="bg-white/5 p-2 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase">Roll No</p>
          <p className="text-sm font-bold">{student.rollNo}</p>
        </div>
        <div className="bg-white/5 p-2 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase">Age</p>
          <p className="text-sm font-bold">{student.age}</p>
        </div>
      </div>
      <div className="mt-4 sm:mt-6 text-left space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-300 break-words">
        <p className="flex items-center gap-3"><span>📧</span> {student.email}</p>
        <p className="flex items-center gap-3"><span>📞</span> {student.phone}</p>
        <p className="flex items-center gap-3"><span>📍</span> {student.address}</p>
      </div>
    </div>

    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-2xl p-4 sm:p-6">
      <h4 className="text-lime-400 font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
        <Users className="w-5 h-5" /> Parents & Guardian Details
      </h4>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Father / Guardian</p>
          <div className="space-y-2">
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase">Name</p>
              <p className="text-sm font-medium">{fatherName || "-"}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase">Occupation</p>
              <p className="text-sm font-medium">{fatherOccupation || "-"}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase">Phone</p>
              <p className="text-sm font-medium">{fatherPhone || "-"}</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Mother</p>
          <div className="space-y-2">
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase">Name</p>
              <p className="text-sm font-medium">{motherName || "-"}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase">Occupation</p>
              <p className="text-sm font-medium">{motherOccupation || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);