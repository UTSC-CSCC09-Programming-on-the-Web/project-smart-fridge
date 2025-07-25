import { Fridge } from "./fridge.model";

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'initialization';
  createdAt?: Date; //optional
  source: `task`| `user` | `fridge` | `system`;
  fridgeId?: string; //optional, only if source is 'fridge'
}