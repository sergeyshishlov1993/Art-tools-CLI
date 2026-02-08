export const categoryIcons: Record<string, string> = {
  'avto-rashodnik': 'i-heroicons-wrench-screwdriver',
  'accum-tool': 'i-heroicons-battery-100',
  'budivnytstvo': 'i-heroicons-building-office',
  'verstaty': 'i-heroicons-cog-6-tooth',
  'electro-tool': 'i-heroicons-bolt',
  'zvaryuvannya': 'i-heroicons-fire',
  'sad-gorod': 'i-heroicons-scissors',
}

export function getCategoryIcon(categoryId: string): string {
  return categoryIcons[categoryId] || 'i-heroicons-cube'
}
