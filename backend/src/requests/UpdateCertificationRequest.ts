/**
 * Fields in a request to update a single certification item.
 */
export interface UpdateCertificationRequest {
  name: string;
  dueDate: string;
  done: boolean;
}
