export type ActiveTab = 'am-lich' | 'ngay-tot' | 'gieo-que' | 'tu-vi' | 'chiem-tinh-tay-phuong' | 'chiem-tinh-vedic' | 'chiem-tinh-hop-la';

/** Maps route paths to tab IDs */
export const ROUTE_TO_TAB: Record<string, ActiveTab> = {
  '/app': 'am-lich',
  '/app/am-lich': 'am-lich',
  '/app/lich-dung-su': 'am-lich',
  '/app/acs': 'am-lich',
  '/app/ngay-tot': 'ngay-tot',
  '/app/gieo-que': 'gieo-que',
  '/app/tu-vi': 'tu-vi',
  '/app/chiem-tinh/tay-phuong': 'chiem-tinh-tay-phuong',
  '/app/chiem-tinh/vedic': 'chiem-tinh-vedic',
  '/app/chiem-tinh/hop-la': 'chiem-tinh-hop-la',
};

/** Maps tab IDs to route paths */
export const TAB_TO_ROUTE: Record<ActiveTab, string> = {
  'am-lich': '/app/am-lich',
  'ngay-tot': '/app/ngay-tot',
  'gieo-que': '/app/gieo-que',
  'tu-vi': '/app/tu-vi',
  'chiem-tinh-tay-phuong': '/app/chiem-tinh/tay-phuong',
  'chiem-tinh-vedic': '/app/chiem-tinh/vedic',
  'chiem-tinh-hop-la': '/app/chiem-tinh/hop-la',
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
  { id: 'ngay-tot', label: 'Ngày Tốt', icon: 'event_available', desc: 'Chọn ngày giờ tốt', enabled: true },
  { id: 'gieo-que', label: 'Gieo quẻ', icon: 'casino', desc: 'Mai Hoa & Tam Thức', enabled: true },
  { id: 'tu-vi', label: 'Tử Vi', icon: 'auto_awesome', desc: 'Tử Vi Đẩu Số', enabled: true },
  { id: 'chiem-tinh-tay-phuong', label: 'C.Tây Phương', icon: 'auto_graph', desc: 'Chiêm tinh phương Tây', enabled: true },
  { id: 'chiem-tinh-vedic', label: 'C.Ấn Độ', icon: 'bubble_chart', desc: 'Chiêm tinh Vedic', enabled: true },
  { id: 'chiem-tinh-hop-la', label: 'Hợp Lá Số', icon: 'favorite', desc: 'Xem hợp nhau', enabled: true },
];
