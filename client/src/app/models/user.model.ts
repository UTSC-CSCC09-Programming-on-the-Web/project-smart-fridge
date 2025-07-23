export interface User {
  id: string;
  name: string;
  email: string;
  is_subscribed: boolean;
  is_first_login: boolean;
  fridges?: { id: string; name: string }[];
}
