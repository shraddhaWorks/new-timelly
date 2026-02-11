'use client';

import { useState, useMemo } from 'react';
import {
  ListChecks,
  Clock,
  CheckCircle2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Upload,
} from 'lucide-react';

export default function Page() {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      title: 'Chapter 5: Quadratic Equations - Exercise 5.3',
      teacher: 'Mr. Rajesh Kumar',
      assigned: '18 Jan 2026',
      due: '23 Jan 2026',
      status: 'Pending',
      description:
        'Complete all questions from Exercise 5.3. Show all steps clearly. Use graph paper for question 7.',
    },
    {
      id: 2,
      subject: 'Science',
      title: 'Physics: Laws of Motion Worksheet',
      teacher: 'Mrs. Kavitha',
      assigned: '15 Jan 2026',
      due: '20 Jan 2026',
      status: 'Submitted',
      description: 'Answer all MCQs and 5 long questions.',
    },
    {
      id: 3,
      subject: 'English',
      title: 'Essay Writing - Climate Change',
      teacher: 'Mr. Daniel',
      assigned: '10 Jan 2026',
      due: '15 Jan 2026',
      status: 'Late',
      description: 'Write 500 word essay on Climate Change.',
    },
  ]);

  const [subject, setSubject] = useState('All Subjects');
  const [status, setStatus] = useState('All');
  const [openId, setOpenId] = useState<number | null>(null);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const subjectMatch =
        subject === 'All Subjects' || item.subject === subject;
      const statusMatch =
        status === 'All' || item.status === status;
      return subjectMatch && statusMatch;
    });
  }, [subject, status, assignments]);

  const total = assignments.length;
  const pending = assignments.filter(a => a.status === 'Pending').length;
  const submitted = assignments.filter(a => a.status === 'Submitted').length;
  const completion = Math.round((submitted / total) * 100);

  const handleUpload = (id: number) => {
    setAssignments(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'Submitted' }
          : item
      )
    );
  };

  return (
    <main className="min-h-screen p-8 space-y-8 bg-[radial-gradient(circle_at_20%_20%,#3b0d68_0%,#1b0f3b_40%,#0f0a24_100%)] text-white">

      {/* HEADER */}
      <section className="card p-7">
        <h1 className="text-2xl font-semibold">
          Homework & Assignments
        </h1>
        <p className="mt-1 text-sm text-white/70">
          Track and submit Aarav Kumar's homework
        </p>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="card statCard">
          <ListChecks className="icon text-lime-400" />
          <div className="statValue">{total}</div>
          <p className="statLabel">All assignments</p>
        </div>

        <div className="card statCard">
          <Clock className="icon text-orange-400" />
          <div className="statValue">{pending}</div>
          <p className="statLabel">Need attention</p>
        </div>

        <div className="card statCard">
          <CheckCircle2 className="icon text-lime-400" />
          <div className="statValue">{submitted}</div>
          <p className="statLabel">On time</p>
        </div>

        <div className="card statCard">
          <TrendingUp className="icon text-yellow-300" />
          <div className="statValue">{completion}%</div>
          <p className="statLabel">Overall progress</p>
        </div>

      </section>

      {/* FILTER */}
      <section className="card p-7 space-y-6">

        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold">Filter Homework</h3>
            <p className="text-sm text-white/70">
              Find assignments quickly
            </p>
          </div>

          <span className="rounded-full border border-lime-400/30 px-4 py-1 text-sm text-lime-300">
            {filteredAssignments.length} Results
          </span>
        </div>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-72 rounded-xl px-4 py-3 bg-transparent border border-white/20 outline-none"
        >
          <option>All Subjects</option>
          <option>Mathematics</option>
          <option>Science</option>
          <option>English</option>
        </select>

        <div className="flex gap-3 flex-wrap">
          {['All', 'Pending', 'Submitted', 'Late'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-6 py-3 rounded-xl border transition ${
                status === tab
                  ? 'border-lime-400 text-lime-300'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* ASSIGNMENTS */}
      <div className="space-y-6">
        {filteredAssignments.map((item) => {

          const statusColor =
            item.status === 'Pending'
              ? 'border-orange-400 text-orange-300'
              : item.status === 'Submitted'
              ? 'border-lime-400 text-lime-300'
              : 'border-red-400 text-red-300';

          return (
            <div key={item.id} className="card p-6">

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-lime-300">{item.subject}</p>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-white/70">
                    {item.teacher} • Due: {item.due}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1 rounded-full text-xs border ${statusColor}`}>
                    {item.status}
                  </span>

                  <button
                    onClick={() =>
                      setOpenId(openId === item.id ? null : item.id)
                    }
                  >
                    {openId === item.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </div>

              {openId === item.id && (
                <div className="mt-6 space-y-4 border-t border-white/20 pt-4">
                  <p className="text-sm text-white/70">
                    {item.description}
                  </p>

                  <button
                    onClick={() => handleUpload(item.id)}
                    className="w-full flex justify-center items-center gap-2 py-3 rounded-xl border border-lime-400 text-lime-300 hover:bg-lime-400/10 transition"
                  >
                    <Upload size={18} />
                    Upload Submission
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .card {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          transition: 0.3s ease;
        }

        .card:hover {
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .statCard {
          padding: 24px;
        }

        .icon {
          height: 24px;
          width: 24px;
        }

        .statValue {
          margin-top: 16px;
          font-size: 28px;
          font-weight: 700;
        }

        

        .statLabel {
          margin-top: 4px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>

    </main>
  );
}
