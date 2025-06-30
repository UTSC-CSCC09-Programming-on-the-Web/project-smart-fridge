// src/app/models/ingredient.model.ts

export interface Ingredient {
  id:  number;         // int
  name: string;         
  quantity: number;          
  unit: string;              // will change to enum in the future
  expire_date: string;       // ISO format date: '2025-07-01'
  added_at: string;          // ISO format date: '2023-10-01T12:00:00Z'
  type?: string;             // will change to enum in the future
  is_expired: boolean;         
  image_url?: string;  // URL to the image of the ingredient, if empty, use a default image
  fridge_id: string;  // uuid（FK）
}