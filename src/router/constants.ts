export type ActiveTab = 'am-lich' | 'ngay-tot' | 'tu-vi' | 'chiem-tinh' | 'gieo-que';

/** Maps route paths to tab IDs */
export const ROUTE_TO_TAB: Record<string, ActiveTab> = {
  '/app': 'am-lich',
  '/app/am-lich': 'am-lich',
  '/app/lich-dung-su': 'ngay-tot',
  '/app/acs': 'am-lich',
  '/app/ngay-tot': 'ngay-tot',
  '/app/tu-vi': 'tu-vi',
  '/app/chiem-tinh': 'chiem-tinh',
  '/app/chiem-tinh/tay-phuong': 'chiem-tinh',
  '/app/chiem-tinh/vedic': 'chiem-tinh',
  '/app/chiem-tinh/hop-la': 'chiem-tinh',
  '/app/vedic': 'chiem-tinh',
  '/app/gieo-que': 'gieo-que',
  '/app/tam-thuc': 'gieo-que',
};

/** Maps tab IDs to route paths */
export const TAB_TO_ROUTE: Record<ActiveTab, string> = {
  'am-lich': '/app/am-lich',
  'ngay-tot': '/app/ngay-tot',
  'tu-vi': '/app/tu-vi',
  'chiem-tinh': '/app/chiem-tinh',
  'gieo-que': '/app/gieo-que',
};

export interface NavLink {
  id: ActiveTab;
  label: string;
  icon: string;
  desc: string;
  enabled: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { id: 'am-lich', label: 'Âm Lịch', icon: 'calendar_month', desc: 'Âm Lịch · Chi tiết ngày', enabled: true },
  { id: 'ngay-tot', label: 'Ngày Tốt & Dụng Sự', icon: 'event_available', desc: 'Tìm ngày tốt · Tra cứu dụng sự', enabled: true },
  { id: 'tu-vi', label: 'Tử Vi', icon: 'auto_awesome', desc: 'Tử Vi Đẩu Số', enabled: true },
  { id: 'chiem-tinh', label: 'Chiêm Tinh', icon: 'auto_graph', desc: 'Tây Phương · Vệ Đà · Hợp lá số', enabled: true },
  { id: 'gieo-que', label: 'Gieo Quẻ', icon: 'casino', desc: 'Mai Hoa & Tam Thức', enabled: true },
];
