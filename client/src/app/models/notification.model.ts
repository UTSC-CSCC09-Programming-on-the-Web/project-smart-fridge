export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  createdAt?: Date; //optional
}
