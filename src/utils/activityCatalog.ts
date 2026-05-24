/**
 * Activity Catalog — Normalized Activity List with Categories
 * Provides the canonical list of activities for the Lịch Dụng Sự page,
 * built from the union of actionWeight.json, dung_su.json, and vtMapping.json.
 */

export interface ActivityEntry {
  id: string;
  nameVi: string;
  category: ActivityCategory;
  icon: string; // Material Icons name
  aliases: string[]; // Alternative names for search matching
}

export type ActivityCategory =
  | 'nha-cua'
  | 'hon-nhan'
  | 'tai-chinh'
  | 'di-chuyen'
  | 'tam-linh'
  | 'suc-khoe'
  | 'nong-nghiep'
  | 'cong-viec'
  | 'giao-duc'
  | 'le-nghi'
  | 'khac';

export interface CategoryInfo {
  id: ActivityCategory;
  label: string;
  icon: string;
  color: string; // Tailwind color class prefix
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'nha-cua', label: 'Nhà cửa', icon: 'home', color: 'blue' },
  { id: 'hon-nhan', label: 'Hôn nhân', icon: 'favorite', color: 'pink' },
  { id: 'tai-chinh', label: 'Tài chính', icon: 'account_balance', color: 'amber' },
  { id: 'cong-viec', label: 'Công việc', icon: 'work', color: 'indigo' },
  { id: 'giao-duc', label: 'Giáo dục', icon: 'school', color: 'teal' },
  { id: 'di-chuyen', label: 'Di chuyển', icon: 'flight_takeoff', color: 'cyan' },
  { id: 'tam-linh', label: 'Tâm linh', icon: 'temple_buddhist', color: 'purple' },
  { id: 'suc-khoe', label: 'Sức khỏe', icon: 'health_and_safety', color: 'emerald' },
  { id: 'nong-nghiep', label: 'Nông nghiệp', icon: 'park', color: 'green' },
  { id: 'le-nghi', label: 'Lễ nghi', icon: 'auto_awesome', color: 'rose' },
  { id: 'khac', label: 'Khác', icon: 'more_horiz', color: 'gray' },
];

export const ACTIVITY_CATALOG: ActivityEntry[] = [
  // ── Nhà cửa ──
  {
    id: 'xay-dung',
    nameVi: 'Xây dựng nhà cửa',
    category: 'nha-cua',
    icon: 'construction',
    aliases: [
      'xây nhà',
      'doanh kiến cung thất',
      'khởi công, làm nhà',
      'dựng cột, làm nhà',
      'hưng tạo',
      'doanh kiến cung thất (xây dựng nhà)',
    ],
  },
  {
    id: 'dong-tho',
    nameVi: 'Động thổ',
    category: 'nha-cua',
    icon: 'landscape',
    aliases: ['đào móng', 'khởi công, đào móng', 'phá thổ', 'phá đất', 'động thổ (đào móng)'],
  },
  {
    id: 'sua-chua',
    nameVi: 'Sửa chữa nhà cửa',
    category: 'nha-cua',
    icon: 'handyman',
    aliases: [
      'tu cung thất',
      'sửa chữa nhà',
      'sửa chữa',
      'tu cung thất (sửa chữa nhà cửa)',
      'sửa chữa, tôn tạo',
      'sửa chữa tôn tạo',
    ],
  },
  {
    id: 'chuyen-nha',
    nameVi: 'Chuyển nhà',
    category: 'nha-cua',
    icon: 'local_shipping',
    aliases: ['vào nhà mới', 'nhập trạch', 'di cư', 'di cư (chuyển nhà)'],
  },
  {
    id: 'lop-mai',
    nameVi: 'Lợp mái',
    category: 'nha-cua',
    icon: 'roofing',
    aliases: ['thượng lương', 'gác đòn dông', 'lợp nhà', 'thượng lương (lợp mái)'],
  },
  {
    id: 'dung-cot',
    nameVi: 'Dựng cột',
    category: 'nha-cua',
    icon: 'view_column',
    aliases: ['thụ trụ', 'thụ trụ (dựng cột)'],
  },
  {
    id: 'ke-giuong',
    nameVi: 'Kê giường',
    category: 'nha-cua',
    icon: 'bed',
    aliases: ['an sàng', 'an sàng (kê giường)'],
  },
  {
    id: 'doi-bep',
    nameVi: 'Dời bếp',
    category: 'nha-cua',
    icon: 'countertops',
    aliases: ['xuất hỏa', 'chuyển bếp', 'xuất hỏa (dời bếp)'],
  },
  {
    id: 'don-dep',
    nameVi: 'Dọn dẹp nhà cửa',
    category: 'nha-cua',
    icon: 'cleaning_services',
    aliases: ['tảo xá vũ', 'quét dọn nhà cửa', 'tẩy uế', 'mộc dục'],
  },
  {
    id: 'pha-do',
    nameVi: 'Phá dỡ nhà',
    category: 'nha-cua',
    icon: 'demolition',
    aliases: ['phá dỡ nhà cũ', 'phá vách', 'phá dỡ'],
  },
  {
    id: 'xay-kho',
    nameVi: 'Xây/Sửa kho',
    category: 'nha-cua',
    icon: 'warehouse',
    aliases: ['xây kho', 'sửa kho', 'tu thương khố', 'tu thương khố (sửa chữa kho tàng)'],
  },
  {
    id: 'xay-tuong',
    nameVi: 'Xây tường/Lấp vá',
    category: 'nha-cua',
    icon: 'fence',
    aliases: ['xây tường', 'lấp vá', 'đắp đê', 'ngăn nước', 'lấp dòng, xây đắp'],
  },
  {
    id: 'thue-nha',
    nameVi: 'Ký hợp đồng thuê nhà',
    category: 'nha-cua',
    icon: 'real_estate_agent',
    aliases: ['thuê nhà', 'ký hợp đồng thuê', 'thuê phòng'],
  },

  // ── Hôn nhân ──
  {
    id: 'cuoi-hoi',
    nameVi: 'Cưới hỏi',
    category: 'hon-nhan',
    icon: 'diamond',
    aliases: ['giá thú', 'thú phụ', 'lấy vợ', 'giá thú (cưới hỏi)', 'thú phụ (lấy vợ, cưới gả)', 'lấy vợ, cưới gả'],
  },
  {
    id: 'an-hoi',
    nameVi: 'Lễ ăn hỏi',
    category: 'hon-nhan',
    icon: 'card_giftcard',
    aliases: ['vấn danh', 'ăn hỏi, đính hôn', 'vấn danh (ăn hỏi)'],
  },
  {
    id: 'dam-ngo',
    nameVi: 'Dạm ngõ',
    category: 'hon-nhan',
    icon: 'handshake',
    aliases: ['nạp thái', 'lễ dạm ngõ', 'nạp thái (dạm ngõ)', 'đi dạm'],
  },
  {
    id: 'nap-le',
    nameVi: 'Nạp lễ cầu thân',
    category: 'hon-nhan',
    icon: 'redeem',
    aliases: ['nạp trưng', 'nạp lễ', 'lễ nạp trưng', 'nạp trưng (nạp lễ cầu thân)', 'mang sính lễ'],
  },
  {
    id: 'don-dau',
    nameVi: 'Đón dâu',
    category: 'hon-nhan',
    icon: 'directions_car',
    aliases: ['thân nghinh', 'rước dâu', 'đưa dâu', 'thân nghinh (đón dâu)'],
  },
  {
    id: 'hop-can',
    nameVi: 'Hợp cẩn',
    category: 'hon-nhan',
    icon: 'wine_bar',
    aliases: ['hợp cẩn', 'lễ hợp cẩn', 'giao bôi', 'tân hôn'],
  },

  // ── Tài chính ──
  {
    id: 'khai-truong',
    nameVi: 'Khai trương',
    category: 'tai-chinh',
    icon: 'storefront',
    aliases: ['khai nghiệp', 'khai trương, mở hàng', 'mở hàng', 'mở cửa hàng', 'khai nghiệp (khai trương)'],
  },
  {
    id: 'giao-dich',
    nameVi: 'Giao dịch',
    category: 'tai-chinh',
    icon: 'swap_horiz',
    aliases: ['kinh thương', 'giao dịch, buôn bán', 'mua bán', 'buôn bán', 'kinh thương (buôn bán)'],
  },
  {
    id: 'ky-hop-dong',
    nameVi: 'Ký hợp đồng',
    category: 'tai-chinh',
    icon: 'description',
    aliases: ['lập khế mãi mại', 'ký kết hợp đồng', 'ký thỏa thuận', 'lập khế mãi mại (ký hợp đồng, mua bán)'],
  },
  { id: 'cau-tai', nameVi: 'Cầu tài', category: 'tai-chinh', icon: 'monetization_on', aliases: ['cầu tài lộc'] },
  {
    id: 'chi-tien',
    nameVi: 'Chi tiền',
    category: 'tai-chinh',
    icon: 'payments',
    aliases: ['xuất tài', 'xuất tiền', 'xuất tiền lớn', 'xuất tài (xuất tiền)'],
  },
  { id: 'thu-tien', nameVi: 'Thu tiền', category: 'tai-chinh', icon: 'savings', aliases: ['thu tiền', 'cất giữ tiền'] },
  {
    id: 'mua-tai-san',
    nameVi: 'Mua tài sản',
    category: 'tai-chinh',
    icon: 'shopping_cart',
    aliases: ['mua tài sản lớn', 'mua xe'],
  },
  {
    id: 'cho-vay',
    nameVi: 'Cho vay',
    category: 'tai-chinh',
    icon: 'account_balance_wallet',
    aliases: ['cho vay', 'cho mượn tiền'],
  },
  {
    id: 'dau-tu',
    nameVi: 'Đầu tư',
    category: 'tai-chinh',
    icon: 'trending_up',
    aliases: ['đầu tư chứng khoán', 'đầu tư bất động sản', 'góp vốn'],
  },
  {
    id: 'nhap-kho',
    nameVi: 'Nhập kho',
    category: 'tai-chinh',
    icon: 'inventory_2',
    aliases: ['nạp tài', 'đem ngũ cốc vào kho', 'nạp tài (nhập kho)', 'cất hàng'],
  },
  {
    id: 'thu-no',
    nameVi: 'Thu nợ',
    category: 'tai-chinh',
    icon: 'request_quote',
    aliases: ['thu trái', 'đòi nợ', 'thu trái (thu nợ)', 'thu hồi nợ'],
  },

  // ── Công việc ──
  {
    id: 'phong-van',
    nameVi: 'Phỏng vấn xin việc',
    category: 'cong-viec',
    icon: 'record_voice_over',
    aliases: ['phỏng vấn', 'xin việc', 'tuyển dụng', 'đi phỏng vấn'],
  },
  {
    id: 'nhan-chuc',
    nameVi: 'Nhận chức',
    category: 'cong-viec',
    icon: 'badge',
    aliases: ['đi nhận chức', 'nhận việc, nhận chức', 'đi nhận việc'],
  },
  {
    id: 'doi-cong-viec',
    nameVi: 'Đổi công việc',
    category: 'cong-viec',
    icon: 'swap_horizontal_circle',
    aliases: ['chuyển việc', 'nghỉ việc cũ', 'nhảy việc'],
  },
  {
    id: 'hop-kinh-doanh',
    nameVi: 'Họp kinh doanh',
    category: 'cong-viec',
    icon: 'groups_2',
    aliases: ['họp công ty', 'hội nghị', 'meeting', 'hội thảo kinh doanh'],
  },
  {
    id: 'thuyet-trinh',
    nameVi: 'Thuyết trình',
    category: 'cong-viec',
    icon: 'present_to_all',
    aliases: ['trình bày', 'báo cáo', 'demo sản phẩm'],
  },
  {
    id: 'khoi-nghiep',
    nameVi: 'Khởi nghiệp',
    category: 'cong-viec',
    icon: 'rocket_launch',
    aliases: ['startup', 'mở công ty', 'thành lập doanh nghiệp'],
  },

  // ── Giáo dục ──
  {
    id: 'nhap-hoc',
    nameVi: 'Nhập học',
    category: 'giao-duc',
    icon: 'school',
    aliases: ['đi học, nhập học', 'hành lễ nhập học', 'học tập', 'học hành'],
  },
  { id: 'thi-cu', nameVi: 'Thi cử', category: 'giao-duc', icon: 'quiz', aliases: ['thi cử', 'thi'] },
  {
    id: 'thi-dai-hoc',
    nameVi: 'Thi đại học',
    category: 'giao-duc',
    icon: 'school',
    aliases: ['thi tuyển sinh', 'thi THPT quốc gia', 'thi đầu vào'],
  },
  {
    id: 'bao-ve-luan-van',
    nameVi: 'Bảo vệ luận văn',
    category: 'giao-duc',
    icon: 'history_edu',
    aliases: ['bảo vệ đồ án', 'thesis defense', 'vấn đáp'],
  },

  // ── Di chuyển ──
  {
    id: 'xuat-hanh',
    nameVi: 'Xuất hành',
    category: 'di-chuyen',
    icon: 'directions_walk',
    aliases: ['đi xa, khởi hành', 'viễn hành', 'đi xa', 'viễn hành (đi xa, khởi hành)', 'xuất hành'],
  },
  {
    id: 've-nha',
    nameVi: 'Về nhà',
    category: 'di-chuyen',
    icon: 'home_pin',
    aliases: ['quy gia', 'viễn hồi', 'đi xa về', 'quy gia (về nhà)', 'viễn hồi (đi xa về)'],
  },
  {
    id: 'di-thuyen',
    nameVi: 'Đi thuyền',
    category: 'di-chuyen',
    icon: 'sailing',
    aliases: ['hành thuyền', 'hạ thủy', 'hành thuyền (đi thuyền)', 'tạo thuyền', 'tạo thuyền (đóng thuyền)'],
  },
  {
    id: 'di-doi',
    nameVi: 'Dời chỗ',
    category: 'di-chuyen',
    icon: 'swap_calls',
    aliases: ['bàn di', 'di tỉ', 'di chuyển', 'dời nhà', 'bàn di (di chuyển)', 'di tỉ (dời chỗ ở)'],
  },
  {
    id: 'leo-nui',
    nameVi: 'Leo núi',
    category: 'di-chuyen',
    icon: 'terrain',
    aliases: ['leo núi', 'nhập sơn', 'nhập sơn (vào núi, săn bắn)', 'săn bắn'],
  },

  // ── Tâm linh ──
  {
    id: 'cung-le',
    nameVi: 'Cúng lễ',
    category: 'tam-linh',
    icon: 'self_improvement',
    aliases: ['cúng tế', 'tế tự', 'lễ bái', 'đảo từ', 'tụng kinh', 'cầu bình an', 'cúng tế, lễ bái'],
  },
  {
    id: 'cau-phuc',
    nameVi: 'Cầu phúc',
    category: 'tam-linh',
    icon: 'volunteer_activism',
    aliases: [
      'kì phúc',
      'cầu phúc, cầu may',
      'cầu nguyện',
      'cầu xin',
      'kiến tiếu',
      'kiến tiếu (cầu phúc, làm việc thiện)',
      'cầu chúc',
      'hứa nguyện',
    ],
  },
  {
    id: 'giai-han',
    nameVi: 'Giải hạn',
    category: 'tam-linh',
    icon: 'shield',
    aliases: ['giải hạn, trừ họa', 'giải tội', 'giải nỗi oan ức', 'trừ phục'],
  },
  {
    id: 'chon-cat',
    nameVi: 'Chôn cất',
    category: 'tam-linh',
    icon: 'nature',
    aliases: ['an táng', 'mai táng', 'xây mộ', 'an táng (chôn cất)', 'cải mộ', 'tu lí phần mộ'],
  },
  { id: 'cau-con', nameVi: 'Cầu con cái', category: 'tam-linh', icon: 'child_care', aliases: ['cầu con cái'] },
  {
    id: 'cau-sieu',
    nameVi: 'Cầu siêu',
    category: 'tam-linh',
    icon: 'brightness_high',
    aliases: ['thiết trai tiếu', 'làm lễ cầu siêu'],
  },
  {
    id: 'ngoi-thien',
    nameVi: 'Ngồi thiền',
    category: 'tam-linh',
    icon: 'spa',
    aliases: ['ngồi thiền', 'tu trai', 'tu trai (sửa sang lễ vật)'],
  },
  {
    id: 'lap-ban-tho',
    nameVi: 'Lập bàn thờ',
    category: 'tam-linh',
    icon: 'temple_buddhist',
    aliases: ['lập bàn thờ', 'lập bàn thờ, làm lễ'],
  },
  {
    id: 'cai-mo',
    nameVi: 'Cải mộ',
    category: 'tam-linh',
    icon: 'compost',
    aliases: ['khải toản', 'di chuyển mồ mả', 'bốc mộ', 'cải táng', 'khải toản (cải mộ)'],
  },
  {
    id: 'ta-dat',
    nameVi: 'Tạ đất',
    category: 'tam-linh',
    icon: 'grass',
    aliases: ['tạ thổ', 'tạ lễ đất đai', 'lễ tạ đất', 'tạ thổ (tạ đất)'],
  },

  // ── Sức khỏe ──
  {
    id: 'kham-benh',
    nameVi: 'Khám bệnh',
    category: 'suc-khoe',
    icon: 'local_hospital',
    aliases: ['cầu y', 'cầu y (khám bệnh)'],
  },
  {
    id: 'chua-benh',
    nameVi: 'Chữa bệnh',
    category: 'suc-khoe',
    icon: 'medical_services',
    aliases: ['liệu bệnh', 'liệu bệnh (chữa bệnh)'],
  },
  {
    id: 'uong-thuoc',
    nameVi: 'Uống thuốc',
    category: 'suc-khoe',
    icon: 'medication',
    aliases: ['phục dược', 'phục dược (uống thuốc)'],
  },
  { id: 'cham-cuu', nameVi: 'Châm cứu', category: 'suc-khoe', icon: 'healing', aliases: ['châm cứu'] },
  {
    id: 'cat-toc',
    nameVi: 'Cắt tóc',
    category: 'suc-khoe',
    icon: 'content_cut',
    aliases: ['chỉnh dung thế đầu', 'cắt tóc, sửa chân mày', 'tắm gội'],
  },
  {
    id: 'kham-tong-quat',
    nameVi: 'Khám sức khỏe tổng quát',
    category: 'suc-khoe',
    icon: 'monitor_heart',
    aliases: ['kiểm tra sức khỏe', 'khám tổng quát', 'health check'],
  },
  {
    id: 'phau-thuat',
    nameVi: 'Phẫu thuật',
    category: 'suc-khoe',
    icon: 'surgical',
    aliases: ['mổ', 'phẫu thuật thẩm mỹ', 'tiểu phẫu'],
  },

  // ── Nông nghiệp ──
  {
    id: 'trong-trot',
    nameVi: 'Trồng trọt',
    category: 'nong-nghiep',
    icon: 'grass',
    aliases: ['chủng thực', 'trồng cây', 'chủng thực (trồng trọt)'],
  },
  {
    id: 'chan-nuoi',
    nameVi: 'Chăm nuôi gia súc',
    category: 'nong-nghiep',
    icon: 'pets',
    aliases: [
      'yết lục súc',
      'mua nuôi gia súc',
      'thăm nuôi gia súc',
      'yết lục súc (thăm nuôi gia súc)',
      'xuyên ngưu tị',
      'xuyên ngưu tị (xỏ mũi trâu)',
    ],
  },
  {
    id: 'chat-cay',
    nameVi: 'Chặt cây',
    category: 'nong-nghiep',
    icon: 'carpenter',
    aliases: ['phạt mộc', 'phạt mộc (chặt cây)'],
  },
  {
    id: 'dao-ao',
    nameVi: 'Đào ao',
    category: 'nong-nghiep',
    icon: 'water',
    aliases: ['khai trì', 'khai trì (đào ao)', 'khai cừ', 'khai cừ (đào kênh)', 'đào kênh'],
  },
  {
    id: 'dao-gieng',
    nameVi: 'Đào giếng',
    category: 'nong-nghiep',
    icon: 'water_drop',
    aliases: ['xuyên tỉnh', 'xuyên tỉnh (đào giếng)'],
  },

  // ── Khác ──
  {
    id: 'nop-don',
    nameVi: 'Nộp đơn từ',
    category: 'khac',
    icon: 'article',
    aliases: [
      'thượng biểu chương',
      'tiến biểu chương',
      'dâng sớ',
      'thượng biểu chương (nộp đơn từ)',
      'tiến biểu chương (dâng sớ, nộp đơn)',
      'thượng sách',
      'thượng sách (dâng kế sách)',
      'dâng kế sách',
    ],
  },
  { id: 'kien-tung', nameVi: 'Kiện tụng', category: 'khac', icon: 'gavel', aliases: ['kiện tụng', 'chấm dứt hợp tác'] },
  {
    id: 'lam-viec-tot',
    nameVi: 'Làm việc tốt',
    category: 'khac',
    icon: 'emoji_events',
    aliases: [
      'làm việc thiện',
      'đền ơn',
      'thi ân',
      'ban ơn',
      'làm việc thiện, cứu giúp',
      'làm việc thiện, công đức',
      'công đức',
      'cứu giúp',
      'hành huệ',
      'giúp người nghèo khó',
      'cứu người nghèo',
      'nhân nghĩa',
    ],
  },
  {
    id: 'gap-ban',
    nameVi: 'Gặp bạn bè',
    category: 'khac',
    icon: 'groups',
    aliases: ['hội thân hữu', 'gặp gỡ', 'hội hữu', 'hội họp', 'hợp tác', 'hợp tương'],
  },
  {
    id: 'mo-tiec',
    nameVi: 'Mở tiệc',
    category: 'khac',
    icon: 'celebration',
    aliases: ['thiết yến', 'mở tiệc, liên hoan', 'khánh điển', 'lễ mừng', 'ban thưởng, mừng'],
  },
  { id: 'hoa-giai', nameVi: 'Hòa giải', category: 'khac', icon: 'handshake', aliases: ['hòa giải', 'giải nỗi oan ức'] },
  {
    id: 'lam-ruou',
    nameVi: 'Làm rượu/Làm tương',
    category: 'khac',
    icon: 'liquor',
    aliases: ['tạo tửu', 'tạo tửu (làm rượu)', 'hợp tương (làm tương, làm bếp)', 'làm rượu', 'làm tương'],
  },
  {
    id: 'nhan-nguoi',
    nameVi: 'Nhận người làm',
    category: 'khac',
    icon: 'person_add',
    aliases: ['tiến nhân khẩu', 'tiến nhân khẩu (nhận người làm)'],
  },
  {
    id: 'tang-phuc',
    nameVi: 'Tang phục',
    category: 'khac',
    icon: 'checkroom',
    aliases: ['bắt đầu mặc áo tang', 'tang phục'],
  },
  {
    id: 'sua-xe',
    nameVi: 'Sửa xe',
    category: 'khac',
    icon: 'build',
    aliases: ['sửa xe hơi', 'bảo dưỡng xe', 'mua xe mới'],
  },

  // ── Lễ nghi (Rituals / Life Ceremonies) ──
  {
    id: 'le-truong-thanh',
    nameVi: 'Lễ trưởng thành',
    category: 'le-nghi',
    icon: 'school',
    aliases: ['quán lễ', '冠禮', 'capping ceremony', 'lễ thành niên'],
  },
  {
    id: 'cai-sua',
    nameVi: 'Cai sữa',
    category: 'le-nghi',
    icon: 'child_care',
    aliases: ['đoạn nhũ', '斷乳', 'weaning', 'thôi nôi'],
  },
  {
    id: 'dat-ten',
    nameVi: 'Đặt tên',
    category: 'le-nghi',
    icon: 'badge',
    aliases: ['mệnh danh', '命名', 'naming ceremony', 'đặt tên cho bé'],
  },
  {
    id: 'khai-quang',
    nameVi: 'Khai quang',
    category: 'le-nghi',
    icon: 'brightness_7',
    aliases: ['khai quang', '開光', 'consecration', 'khai quang điểm nhãn'],
  },
  {
    id: 'tam-goi',
    nameVi: 'Tắm gội (Mộc dục)',
    category: 'le-nghi',
    icon: 'spa',
    aliases: ['mộc dục', '沐浴', 'ritual bathing', 'trai giới'],
  },

  // ── P2: Niche Activities from Hiệp Kỷ 協紀辨方書 ──
  {
    id: 'tho-tao',
    nameVi: 'Thờ Táo',
    category: 'tam-linh',
    icon: 'local_fire_department',
    aliases: ['tự táo', '祀竈', 'thờ phượng táo thần', 'ông táo'],
  },

  {
    id: 'thang-quan',
    nameVi: 'Thăng quan',
    category: 'cong-viec',
    icon: 'trending_up',
    aliases: ['thượng quan', '上官', 'nhận chức lớn', 'thăng tiến'],
  },
  {
    id: 'dong-thuyen',
    nameVi: 'Đóng thuyền',
    category: 'di-chuyen',
    icon: 'sailing',
    aliases: ['tạo thuyền', '造船', 'đóng thuyền mới', 'sửa thuyền'],
  },
  {
    id: 'mo-cong',
    nameVi: 'Mở cống',
    category: 'nong-nghiep',
    icon: 'water',
    aliases: ['phóng thủy', '放水', 'mở cống phóng thủy', 'dẫn nước'],
  },
  {
    id: 'bat-ca',
    nameVi: 'Bắt cá',
    category: 'nong-nghiep',
    icon: 'phishing',
    aliases: ['bổ ngư', '捕魚', 'đánh bắt cá', 'thả lưới'],
  },
];

/**
 * Build a search index: lowercase alias → activity id.
 * Used for matching dụng sự engine outputs back to catalog entries.
 */
// Pre-built ID → activity Map for O(1) lookup
const CATALOG_BY_ID = new Map<string, ActivityEntry>(ACTIVITY_CATALOG.map((a) => [a.id, a]));

/** Get an activity by its ID (O(1)). */
export function getActivityById(id: string): ActivityEntry | undefined {
  return CATALOG_BY_ID.get(id);
}

const aliasIndex = new Map<string, string>();
ACTIVITY_CATALOG.forEach((a) => {
  aliasIndex.set(a.nameVi.toLowerCase(), a.id);
  a.aliases.forEach((al) => aliasIndex.set(al.toLowerCase(), a.id));
});

/** Look up an activity ID by any of its names (case-insensitive). */
export function findActivityByName(name: string): ActivityEntry | undefined {
  const lower = name.toLowerCase().trim();
  const id = aliasIndex.get(lower);
  if (id) return CATALOG_BY_ID.get(id);

  // Partial match fallback
  for (const [alias, actId] of aliasIndex.entries()) {
    if (lower.includes(alias) || alias.includes(lower)) {
      return CATALOG_BY_ID.get(actId);
    }
  }
  return undefined;
}

/** Get all activities in a given category. */
export function getActivitiesByCategory(category: ActivityCategory): ActivityEntry[] {
  return ACTIVITY_CATALOG.filter((a) => a.category === category);
}

/** Search activities by keyword (matches nameVi and aliases). */
export function searchActivities(query: string): ActivityEntry[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase().trim();
  return ACTIVITY_CATALOG.filter(
    (a) => a.nameVi.toLowerCase().includes(lower) || a.aliases.some((al) => al.toLowerCase().includes(lower)),
  );
}

/**
 * Map raw Nghi/Kỵ event strings from the engine to catalog activity IDs.
 * Returns Sets of activity IDs that are suitable or unsuitable for the given day.
 */
export function mapDungSuToActivityIds(
  suitable: string[],
  unsuitable: string[],
): { suitableIds: Set<string>; unsuitableIds: Set<string> } {
  const suitableIds = new Set<string>();
  const unsuitableIds = new Set<string>();

  for (const raw of suitable) {
    const cleaned = raw.split(' (')[0].trim();
    const entry = findActivityByName(cleaned);
    if (entry) suitableIds.add(entry.id);
  }

  for (const raw of unsuitable) {
    const cleaned = raw.split(' (')[0].trim();
    const entry = findActivityByName(cleaned);
    if (entry) unsuitableIds.add(entry.id);
  }

  return { suitableIds, unsuitableIds };
}

/**
 * Lấy số ngày tối đa quét cho next-best-date dựa trên loại hoạt động.
 * - Tang lễ: 7 ngày (khẩn cấp)
 * - Sức khỏe, Xuất hành: 14 ngày (ngắn hạn)
 * - Kinh doanh, Tài chính: 30 ngày (trung hạn)
 * - Nhà cửa, Hôn nhân: 365 ngày (kế hoạch lớn)
 * - Mặc định: 30 ngày
 */
export function getMaxSearchDaysForActivity(activityId: string): number {
  const entry = findActivityByName(activityId);
  if (!entry) return 30;

  switch (entry.category) {
    case 'tam-linh':
      // Tang lễ khẩn cấp
      if (['chon-cat', 'cau-sieu', 'cai-mo', 'tang-phuc'].includes(activityId)) return 14;
      return 60;
    case 'suc-khoe':
    case 'di-chuyen':
      return 14;
    case 'tai-chinh':
    case 'cong-viec':
      return 30;
    case 'nha-cua':
    case 'hon-nhan':
      return 365;
    default:
      return 30;
  }
}
