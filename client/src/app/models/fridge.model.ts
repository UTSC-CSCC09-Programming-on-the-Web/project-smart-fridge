

export interface Fridge {
  id: string;
  name: string;
  description: string;
  users: { id: string; name: string }[];
}
