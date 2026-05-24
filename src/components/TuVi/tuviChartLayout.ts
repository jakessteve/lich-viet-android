export type TuViGridCell = {
  row: number;
  col: number;
  chiIndex: number;
};

export const GRID_MAP: TuViGridCell[] = [
  { row: 0, col: 0, chiIndex: 5 },
  { row: 0, col: 1, chiIndex: 6 },
  { row: 0, col: 2, chiIndex: 7 },
  { row: 0, col: 3, chiIndex: 8 },
  { row: 1, col: 0, chiIndex: 4 },
  { row: 1, col: 3, chiIndex: 9 },
  { row: 2, col: 0, chiIndex: 3 },
  { row: 2, col: 3, chiIndex: 10 },
  { row: 3, col: 0, chiIndex: 2 },
  { row: 3, col: 1, chiIndex: 1 },
  { row: 3, col: 2, chiIndex: 0 },
  { row: 3, col: 3, chiIndex: 11 },
];

export function getKhongLabel(palace: { hasTuan: boolean; hasTriet: boolean }) {
  if (palace.hasTuan && palace.hasTriet) {
    return 'Tuần - Triệt';
  }

  if (palace.hasTuan) {
    return 'Tuần';
  }

  if (palace.hasTriet) {
    return 'Triệt';
  }

  return null;
}
