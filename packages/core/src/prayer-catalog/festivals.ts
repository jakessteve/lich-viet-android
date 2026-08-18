export interface LunarFestival {
  id: string;
  name: string;
  lunarDay: number;
  lunarMonth: number;
  description: string;
  customs: string[];
  isMajorHoliday: boolean;
}

export const LUNAR_FESTIVALS: LunarFestival[] = [
  {
    id: 'tet_nguyen_dan',
    name: 'Tết Nguyên Đán (Tết Cổ Truyền)',
    lunarDay: 1,
    lunarMonth: 1,
    description: 'Ngày lễ truyền thống lớn nhất trong năm của dân tộc Việt Nam, sum họp gia đình và đón năm mới.',
    customs: ['Chúc Tết', 'Mừng tuổi', 'Khai xuân', 'Cúng gia tiên'],
    isMajorHoliday: true,
  },
  {
    id: 'tet_nguyen_tieu',
    name: 'Tết Nguyên Tiêu (Rằm Tháng Giêng)',
    lunarDay: 15,
    lunarMonth: 1,
    description: 'Cúng cả năm không bằng Rằm tháng Giêng, ngày rằm đầu tiên cầu an cho cả năm.',
    customs: ['Đi chùa cầu an', 'Thả đèn hoa đăng', 'Cúng chè trôi nước'],
    isMajorHoliday: true,
  },
  {
    id: 'tet_han_thuc',
    name: 'Tết Hàn Thực',
    lunarDay: 3,
    lunarMonth: 3,
    description: 'Tết ăn đồ nguội, tưởng nhớ cội nguồn và người thân đã khuất.',
    customs: ['Làm bánh trôi, bánh chay', 'Cúng tổ tiên'],
    isMajorHoliday: false,
  },
  {
    id: 'gio_to_hung_vuong',
    name: 'Giỗ Tổ Hùng Vương',
    lunarDay: 10,
    lunarMonth: 3,
    description: 'Dù ai đi ngược về xuôi, nhớ ngày Giỗ Tổ mùng mười tháng ba. Tưởng nhớ các Vua Hùng dựng nước.',
    customs: ['Hành hương Đền Hùng', 'Dâng hương tưởng niệm'],
    isMajorHoliday: true,
  },
  {
    id: 'phat_dan',
    name: 'Lễ Phật Đản (Vesak)',
    lunarDay: 15,
    lunarMonth: 4,
    description: 'Kỷ niệm ngày Đức Phật Thích Ca Mâu Ni đản sinh.',
    customs: ['Tắm Phật', 'Làm việc thiện', 'Ăn chay niệm Phật'],
    isMajorHoliday: false,
  },
  {
    id: 'tet_doan_ngo',
    name: 'Tết Đoan Ngọ (Giết Sâu Bọ)',
    lunarDay: 5,
    lunarMonth: 5,
    description: 'Tết diệt sâu bọ, phòng ngừa dịch bệnh giữa tiết trời oi ả của mùa hè.',
    customs: ['Ăn rượu nếp', 'Ăn hoa quả chua', 'Tắm lá thơm', 'Khảo cây'],
    isMajorHoliday: true,
  },
  {
    id: 'le_vu_lan',
    name: 'Lễ Vu Lan & Xá Tội Vong Nhân (Rằm Tháng Bảy)',
    lunarDay: 15,
    lunarMonth: 7,
    description: 'Ngày báo hiếu cha mẹ và mở cửa ngục xá tội cho các vong linh bơ vơ.',
    customs: ['Bông hồng cài áo', 'Cúng thí thực cô hồn', 'Đi chùa phóng sinh', 'Cúng gia tiên'],
    isMajorHoliday: true,
  },
  {
    id: 'tet_trung_thu',
    name: 'Tết Trung Thu (Tết Trông Trăng)',
    lunarDay: 15,
    lunarMonth: 8,
    description: 'Tết thiếu nhi, đoàn viên gia đình ngắm trăng rằm sáng nhất trong năm.',
    customs: ['Rước đèn ông sao', 'Múa lân', 'Phá cỗ trông trăng', 'Ăn bánh nướng bánh dẻo'],
    isMajorHoliday: true,
  },
  {
    id: 'tet_trung_cuu',
    name: 'Tết Trùng Cửu',
    lunarDay: 9,
    lunarMonth: 9,
    description: 'Tết hoa cúc, ngày số 9 kép may mắn, thanh tao du ngoạn ngắm cảnh thu.',
    customs: ['Leo núi', 'Thưởng trà hoa cúc', 'Làm thơ'],
    isMajorHoliday: false,
  },
  {
    id: 'tet_trung_thap',
    name: 'Tết Trùng Thập (Tết Thầy Thuốc / Tết Cơm Mới)',
    lunarDay: 10,
    lunarMonth: 10,
    description: 'Lễ mừng cơm mới sau mùa gặt và tri ân các bậc thầy thuốc đông y.',
    customs: ['Làm bánh giầy', 'Nấu cơm mới', 'Tạ ơn thần Nông'],
    isMajorHoliday: false,
  },
  {
    id: 'ong_tao_chau_troi',
    name: 'Tết Ông Công Ông Táo',
    lunarDay: 23,
    lunarMonth: 12,
    description: 'Lễ tiễn ba vị thần Táo Quân cưỡi cá chép lên chầu Trời báo cáo việc hạ giới.',
    customs: ['Thả cá chép đỏ', 'Dọn dẹp bàn thờ', 'Bao sái bát hương'],
    isMajorHoliday: true,
  },
];
