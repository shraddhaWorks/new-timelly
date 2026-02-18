'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  teacher: {
    name: string;
  };
  dueDate: string | null;
  assignedDate: string | null;
  hasSubmitted?: boolean;
  submission?: {
    id: string;
    fileUrl: string | null;
    submittedAt: string;
  } | null;
}

interface HomeworkCardProps {
  homework: Homework;
  onUpload: (homeworkId: string) => void;
  isUploading?: boolean;
}

export default function HomeworkCard({
  homework,
  onUpload,
  isUploading = false,
}: HomeworkCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not set';
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Not set';
    }
  };

  const getStatus = () => {
    if (homework.hasSubmitted) {
      return 'Submitted';
    }
    if (homework.dueDate) {
      const due = new Date(homework.dueDate);
      const now = new Date();
      if (now > due) {
        return 'Late';
      }
    }
    return 'Pending';
  };

  const status = getStatus();
  const statusColor =
    status === 'Pending'
      ? 'border-orange-400 text-orange-300'
      : status === 'Submitted'
      ? 'border-lime-400 text-lime-300'
      : 'border-red-400 text-red-300';

  return (
    <div className="min-w-0 w-full max-w-full somu rounded-2xl p-4 sm:p-5 md:p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start sm:gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-lime-300">{homework.subject}</p>
          <h3 className="text-base sm:text-lg font-semibold break-words">{homework.title}</h3>
          <p className="text-xs sm:text-sm text-white/70 mt-0.5 break-words">
            {homework.teacher.name} • Due: {formatDate(homework.dueDate)}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <span className={`px-3 py-1 sm:px-4 rounded-full text-xs border ${statusColor}`}>
            {status}
          </span>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1 -m-1 touch-manipulation"
          >
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 border-t border-white/20 pt-3 sm:pt-4">
          <p className="text-xs sm:text-sm text-white/70 break-words">
            {homework.description}
          </p>

          {homework.submission?.fileUrl && (
            <div className="text-sm text-white/70">
              <p>Submitted on: {formatDate(homework.submission.submittedAt)}</p>
              {homework.submission.fileUrl && (
                <a
                  href={homework.submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lime-300 hover:underline"
                >
                  View submitted file
                </a>
              )}
            </div>
          )}

          {!homework.hasSubmitted && (
            <button
              onClick={() => onUpload(homework.id)}
              disabled={isUploading}
              className="w-full min-h-[44px] flex justify-center items-center gap-2 py-3 sm:py-3 rounded-xl border border-lime-400 text-lime-300 hover:bg-lime-400/10 transition disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-base touch-manipulation"
            >
              <Upload size={18} />
              {isUploading ? 'Uploading...' : 'Upload Submission'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
