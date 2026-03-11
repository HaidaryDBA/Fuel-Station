// utils/generateRandomColors.ts

export function generateRandomColors(count: number): string[] {
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * 156) + 100; // Avoid too dark colors
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
  }

  return colors;
}