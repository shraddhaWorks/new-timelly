'use client';

interface HomeworkHeaderProps {
  studentName: string;
}

export default function HomeworkHeader({ studentName }: HomeworkHeaderProps) {
  return (
    <section className="min-w-0 somu rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7">
      <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-semibold break-words">
        Homework & Assignments
      </h1>
      <p className="mt-1 text-xs sm:text-sm text-white/70 break-words">
        Track and submit {studentName}'s homework
      </p>
    </section>
  );
}
