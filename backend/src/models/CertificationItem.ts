export interface CertificationItem {
  userId: string;
  certificationId: string;
  createdAt: string;
  name: string;
  dueDate: string;
  done: boolean;
  attachmentUrl?: string;
}
