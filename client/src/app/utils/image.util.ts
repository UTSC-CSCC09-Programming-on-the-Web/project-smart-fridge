export function validateImageFile(file: File): string | null {
  const maxSizeMB = 5;
  const allowedTypes = ['image/png', 'image/jpeg'];

  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Image ${file.name} is too large (max 5MB).`;
  }

  if (!allowedTypes.includes(file.type)) {
    return `Image ${file.name} has invalid type. Only PNG/JPEG are allowed.`;
  }

  return null; // valid
}

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

