export const CHI = [
  "Ty", "Suu", "Dan", "Mao", "Thin", "Ti",
  "Ngo", "Mui", "Than", "Dau", "Tuat", "Hoi"
];

export const CHI_VI = [
  "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ",
  "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"
];

export function getBranchNumber(chi) {
  let index = CHI.indexOf(chi);
  if (index === -1) index = CHI_VI.indexOf(chi);
  if (index === -1) {
    throw new Error(`Invalid Branch (Chi): ${chi}`);
  }
  return index + 1;
}
