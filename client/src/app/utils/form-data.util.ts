
import { Ingredient } from '../models/ingredient.model';

/**
 * Converts an ingredient object to FormData format.
 * 
 * @param ingredient - The ingredient object to convert.
 * @param imageFile - Optional image file to include in the FormData.
 * @returns A FormData object containing the ingredient data and image file.
 */
export function ingredientToFormData(
  ingredient: Partial<Ingredient>,
  imageFile?: File | null
): FormData {
  const formData = new FormData();

  const keys = Object.keys(ingredient) as (keyof Ingredient)[];
  for (const key of keys) {
    const value = ingredient[key];
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  }
  // console.log("FormData keys:", Array.from(formData.keys()));
  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
}