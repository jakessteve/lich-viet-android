export type ActiveTab = 'am-lich' | 'la-ban' | 'gieo-que' | 'tu-vi';

/** Maps route paths to tab IDs */
export const ROUTE_TO_TAB: Record<string, ActiveTab> = {
  '/app': 'am-lich',
  '/app/am-lich': 'am-lich',
  '/app/lich-dung-su': 'am-lich',
  '/app/la-ban': 'la-ban',
  '/app/phong-thuy': 'la-ban',
  '/app/acs': 'am-lich',
  '/app/gieo-que': 'gieo-que',
  '/app/tu-vi': 'tu-vi',
};

/** Maps tab IDs to route paths */
export const TAB_TO_ROUTE: Record<ActiveTab, string> = {
  'am-lich': '/app/am-lich',
  'la-ban': '/app/la-ban',
  'gieo-que': '/app/gieo-que',
  'tu-vi': '/app/tu-vi',
};

export interface NavLink {
  id: ActiveTab;
  label: string;
  icon: string;
  desc: string;
  enabled: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { id: 'am-lich', label: 'Âm lịch', icon: 'calendar_month', desc: 'Âm lịch · Dụng sự', enabled: true },
  { id: 'la-ban', label: 'La bàn', icon: 'explore', desc: 'Phong thủy · Phi tinh', enabled: true },
  { id: 'gieo-que', label: 'Gieo quẻ', icon: 'casino', desc: 'Mai Hoa & Tam Thức', enabled: true },
  { id: 'tu-vi', label: 'Tử Vi', icon: 'auto_awesome', desc: 'Tử Vi Đẩu Số', enabled: true },
];
