'use client';

import { useRef } from 'react';
import { ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import AttachmentPreview from '../../common/AttachmentPreview';

export type AssignmentItem = {
  id: string;
  subject: string;
  title: string;
  teacher: string;
  assigned: string;
  due: string;
  status: string;
  description: string;
  /** Teacher's assignment attachment (PDF, image, etc.) */
  assignmentFile?: string | null;
  /** Student's submission attachment URL (after submit) */
  submissionFileUrl?: string | null;
};

type ParentHomeworkAssignmentCardProps = {
  item: AssignmentItem;
  isOpen: boolean;
  onToggle: () => void;
  onUpload: (id: string, file?: File) => void;
  uploading?: boolean;
};

const ACCEPT_FILES = 'image/*,.pdf,.doc,.docx';

export default function ParentHomeworkAssignmentCard({
  item,
  isOpen,
  onToggle,
  onUpload,
  uploading = false,
}: ParentHomeworkAssignmentCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusColor =
    item.status === 'Pending'
      ? 'border-orange-400 text-orange-300'
      : item.status === 'Submitted'
        ? 'border-lime-400 text-lime-300'
        : 'border-red-400 text-red-300';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(item.id, file);
    e.target.value = '';
  };

  const handleUploadClick = () => {
    if (item.status === 'Submitted') return;
    fileInputRef.current?.click();
  };

  return (
    <div className="somu rounded-2xl p-6 text-white transition-all duration-200 hover:border-white/20 hover:shadow-lg">
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
            type="button"
            onClick={onToggle}
            className="text-white/80 hover:text-white"
          >
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-6 space-y-4 border-t border-white/20 pt-4">
          <p className="text-sm text-white/70">
            {item.description}
          </p>

          {item.assignmentFile && (
            <div>
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">Assignment attachment</p>
              <AttachmentPreview url={item.assignmentFile} label="View assignment attachment" />
            </div>
          )}

          {item.status === 'Submitted' && item.submissionFileUrl && (
            <div>
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">Your submission</p>
              <AttachmentPreview url={item.submissionFileUrl} label="View your submission" />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_FILES}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading || item.status === 'Submitted'}
            className="w-full flex justify-center items-center gap-2 py-3 rounded-xl border border-lime-400 text-lime-300 hover:bg-lime-400/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>Uploading…</>
            ) : (
              <>
                <Paperclip size={18} />
                Attach photo or document & submit
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
