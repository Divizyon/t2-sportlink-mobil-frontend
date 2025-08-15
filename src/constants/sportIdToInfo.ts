// Sport ID'den spor adını ve renk kodunu eşleyen tablo
export const sportIdToInfo: Record<string, { name: string; color: string }> = {
  // Örnek ID'ler, backend'den alınan gerçek ID'lerle güncellenmeli
  '550e8400-e29b-41d4-a716-446655440000': { name: 'Futbol', color: '#64BF77' },
  '550e8400-e29b-41d4-a716-446655440001': { name: 'Basketbol', color: '#479B6E' },
  '550e8400-e29b-41d4-a716-446655440002': { name: 'Yüzme', color: '#27BCE7' },
  '550e8400-e29b-41d4-a716-446655440003': { name: 'Yürüyüş', color: '#8EC2DC' },
  '550e8400-e29b-41d4-a716-446655440004': { name: 'Tenis', color: '#DF7352' },
  '550e8400-e29b-41d4-a716-446655440005': { name: 'Koşu', color: '#EF8359' },
};
