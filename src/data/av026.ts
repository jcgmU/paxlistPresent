// Subconjunto de FLIGHT_AV026 de la app (datos de demostración): Business 1–5 y Plus 8–9.
export type Tier = 'magno' | 'diamond' | 'gold';

export interface SeatData {
  id: string;
  col: string;
  occupied: boolean;
  tier?: Tier;
  codes: string[];
  nps?: boolean;
}

export interface RowData {
  row: number;
  seats: (SeatData | 'aisle')[];
}

export interface CabinData {
  cls: 'business' | 'plus';
  label: string;
  rows: RowData[];
}

type Raw = Record<string, { tier?: Tier; codes?: string[]; nps?: boolean }>;

function build(layout: string[], rows: number[], occupied: Raw): RowData[] {
  return rows.map((row) => ({
    row,
    seats: layout.map((col) => {
      if (col === 'aisle') return 'aisle' as const;
      const id = `${row}${col}`;
      const p = occupied[id];
      return { id, col, occupied: !!p, tier: p?.tier, codes: p?.codes ?? [], nps: p?.nps };
    }),
  }));
}

const businessOccupied: Raw = {
  '1A': { tier: 'magno' },
  '1D': { tier: 'diamond' },
  '1E': { tier: 'gold' },
  '1K': {},
  '2A': { tier: 'gold', codes: ['VGML'] },
  '2D': {},
  '2E': {},
  '2K': {},
  '3A': { tier: 'diamond' },
  '3D': {},
  '3E': { tier: 'gold' },
  '3K': { nps: true },
  '4A': {},
  '4D': {},
  '4E': { tier: 'gold', codes: ['GFML'] },
  '5A': {},
  '5D': {},
  '5K': {},
};

const plusOccupied: Raw = {
  '8A': {},
  '8B': {},
  '8C': {},
  '8D': {},
  '8E': { codes: ['BBML', 'INF'] },
  '8F': {},
  '8G': {},
  '8K': {},
  '9A': { codes: ['WCHR'] },
  '9C': {},
  '9D': {},
  '9F': {},
  '9G': {},
  '9J': {},
  '9K': {},
};

export const AV026 = {
  flightNumber: 'AV026',
  origin: 'BOG',
  destination: 'MAD',
  aircraft: 'B787-8',
  service: 'Insignia',
  cabins: [
    { cls: 'business', label: 'Business', rows: build(['A', 'aisle', 'D', 'E', 'aisle', 'K'], [1, 2, 3, 4, 5], businessOccupied) },
    { cls: 'plus', label: 'Plus', rows: build(['A', 'B', 'C', 'aisle', 'D', 'E', 'F', 'aisle', 'G', 'J', 'K'], [8, 9], plusOccupied) },
  ] as CabinData[],
  nps: { seat: '3K', comment: 'Vuelo anterior con retraso de 4 horas sin compensación.' },
  // Menú Insignia · almuerzo, plato fuerte (stock inicial de la demo)
  meals: [
    { name: 'Lomo de res al vino tinto', stock: 4 },
    { name: 'Salmón en costra de hierbas', stock: 4 },
    { name: 'Risotto de hongos silvestres', stock: 3 },
  ],
  kitSizes: ['S/M', 'L/XL', 'XXL'] as const,
};

const allSeats = AV026.cabins.flatMap((c) => c.rows.flatMap((r) => r.seats.filter((s): s is SeatData => s !== 'aisle')));
const business = AV026.cabins[0].rows.flatMap((r) => r.seats.filter((s): s is SeatData => s !== 'aisle'));

export const stats = {
  businessSeats: business.length,
  businessOccupied: business.filter((s) => s.occupied).length,
  magno: business.filter((s) => s.tier === 'magno').map((s) => s.id),
  diamond: business.filter((s) => s.tier === 'diamond').map((s) => s.id),
  gold: business.filter((s) => s.tier === 'gold').map((s) => s.id),
  inf: allSeats.filter((s) => s.codes.includes('INF')).length,
  ssr: allSeats.filter((s) => s.codes.length > 0).length,
  wchr: allSeats.filter((s) => s.codes.includes('WCHR')).length,
};

export function lensList(seat: SeatData): string {
  const l: string[] = [];
  if (seat.codes.includes('INF')) l.push('inf');
  if (seat.codes.length > 0) l.push('ssr');
  if (seat.codes.includes('WCHR')) l.push('wchr');
  return l.join(' ');
}
