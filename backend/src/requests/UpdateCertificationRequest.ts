/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateCertificationRequest {
  name: string;
  dueDate: string;
  done: boolean;
}
