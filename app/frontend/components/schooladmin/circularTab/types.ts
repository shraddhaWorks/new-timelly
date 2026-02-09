export interface CircularRow {
  id: string;
  referenceNumber: string;
  date: string;
  subject: string;
  content: string;
  importanceLevel: string;
  recipients: string[];
  attachments?: string[];
  classId: string | null;
  publishStatus: string;
  issuedBy: { id: string; name: string | null };
}
