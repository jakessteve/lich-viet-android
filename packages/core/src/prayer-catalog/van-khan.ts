export interface VanKhanItem {
  id: string;
  title: string;
  category: 'gia_tien' | 'than_tai' | 'le_tet' | 'dam_gio' | 'nhap_trach' | 'dong_tho' | 'khac';
  lunarTriggers?: { day?: number; month?: number }[];
  instructions: string;
  prayerText: string;
  source: string;
}

export const VAN_KHAN_CATALOG: VanKhanItem[] = [
  {
    id: 'vk_mung_1_ram',
    title: 'Văn Khấn Mùng 1 và Ngày Rằm Hàng Tháng (Gia Tiên)',
    category: 'gia_tien',
    lunarTriggers: [{ day: 1 }, { day: 15 }],
    instructions: 'Sắm lễ: Hương, hoa tươi, trầu cau, quả tươi, nước sạch, đèn nến, tiền vàng mã, cỗ mặn hoặc cỗ chay.',
    prayerText: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)
Con lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.
Con kính lạy Hoàng thiên Hậu Thổ chư vị Tôn thần.
Con kính lạy ngài Bản cảnh Thành Hoàng, ngài Bản xứ Thổ địa, ngài Bản gia Táo Quân cùng Chư vị Tôn thần.
Con kính lạy Tổ Tiên, Hiển khảo, Hiển tỷ, Chư vị Hương linh gia tiên nội ngoại.

Tín chủ con là: ...
Ngụ tại: ...
Hôm nay là ngày ... tháng ... âm lịch.
Tín chủ con thành tâm sắm sửa hương hoa lễ vật, kim ngân trà quả, dâng lên trước án, lòng thành kính cẩn.
Cúi xin Chư vị Tôn thần, Gia tiên tiền tổ giáng lâm trước án chứng giám lòng thành, thụ hưởng lễ vật, phù hộ độ trì cho toàn gia an ninh khang thái, vạn sự hanh thông, sở cầu như ý, sở nguyện tòng tâm.

Chúng con lễ bạc tâm thành, trước án kính lễ, cúi xin được phù hộ độ trì.
Nam mô A Di Đà Phật! (3 lần, 3 lạy)`,
    source: 'Văn khấn cổ truyền Việt Nam',
  },
  {
    id: 'vk_than_tai',
    title: 'Văn Khấn Thần Tài và Thổ Địa Hàng Ngày / Mùng 10',
    category: 'than_tai',
    lunarTriggers: [{ day: 10 }],
    instructions: 'Sắm lễ: Hoa cúc vàng, đĩa hoa quả ngũ quả, nước sạch, rượu, nến, bánh kẹo, bộ tam sên (thịt heo, tôm/cua, trứng luộc).',
    prayerText: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)
Con kính lạy Chư vị Tôn thần quản cai khu vực bản gia bản thổ.
Con kính lạy ngài Đông Trù Tư Mệnh Táo Phủ Thần Quân.
Con kính lạy ngài Thần Tài vị tiền, ngài Thổ Địa vị tiền.

Tín chủ con là: ...
Cửa hàng / Công ty: ...
Địa chỉ tại: ...
Hôm nay ngày ... tháng ...
Tín chủ con thành tâm sửa biện hương hoa lễ vật, kim ngân đăng trà, dâng lên trước bàn thờ Thần Tài - Thổ Địa.
Cúi xin ngài giáng lâm án tọa, thụ hưởng lễ vật, phù trì cho việc làm ăn kinh doanh buôn may bán đắt, khách đáo tài tiến, tài lộc dồi dào, gia đạo bình an.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`,
    source: 'Nghi lễ dân gian truyền thống',
  },
  {
    id: 'vk_ong_tao_23_thang_chap',
    title: 'Văn Khấn Lễ Tiễn Táo Quân Chầu Trời (23 Tháng Chạp)',
    category: 'le_tet',
    lunarTriggers: [{ day: 23, month: 12 }],
    instructions: 'Sắm lễ: 3 bộ mũ Táo Quân (2 mũ ông, 1 mũ bà kèm hia), 3 con cá chép sống thả trong chậu nước, mâm cỗ mặn/chay, hoa tươi, trầu cau.',
    prayerText: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)
Con kính lạy Ngài Đông Trù Tư Mệnh Táo Phủ Thần Quân.
Tín chủ con là: ...
Ngụ tại: ...
Hôm nay ngày 23 tháng Chạp năm ..., tín chủ con thành tâm sắm sửa hương hoa phẩm vật, xiêm hài áo mũ, kính dâng Tôn thần.
Thắp nén tâm hương kính cẩn dâng trình.
Kính cẩn thỉnh cầu ngài Táo Quân cưỡi cá chép về trời, tâu bày lên Ngọc Hoàng Thượng Đế những việc tốt lành, xin gia ân ban phúc cho toàn gia quyến năm mới dồi dào sức khỏe, an khang thịnh vượng.
Chúng con lễ bạc tâm thành kính cẩn tiến dâng.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`,
    source: 'Văn khấn cổ truyền Việt Nam',
  },
  {
    id: 'vk_giao_thua_ngoai_troi',
    title: 'Văn Khấn Giao Thừa Ngoài Trời (Trừ Tịch)',
    category: 'le_tet',
    lunarTriggers: [{ day: 30, month: 12 }, { day: 29, month: 12 }],
    instructions: 'Sắm lễ: Bàn lễ đặt ngoài trời, gà trống hoa luộc ngậm hoa hồng, bánh chưng, mâm ngũ quả, trầu cau, rượu, trà, đèn nến, vàng mã.',
    prayerText: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)
Con kính lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.
Con kính lạy Quan Đương niên Hành khiển Thái Tuế chí đức Tôn thần.
Con kính lạy các quan Phán quan, Ngũ phương, Ngũ thổ Long Mạch Tôn thần.

Phút thiêng liêng Giao thừa vừa tới, năm cũ qua đi, đón mừng năm mới, Tam Dương khai thái, vạn tượng canh tân.
Tín chủ con là: ...
Ngụ tại: ...
Nhân khắc giao thừa, tín chủ con thành tâm sửa biện hương hoa phẩm vật, dâng lên trước án.
Cung thỉnh chư vị Tôn thần chứng giám lòng thành, thụ hưởng lễ vật, che chở cho gia đạo một năm mới bình an, phúc lộc trường tồn.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`,
    source: 'Văn khấn cổ truyền Việt Nam',
  },
  {
    id: 'vk_giao_thua_trong_nha',
    title: 'Văn Khấn Giao Thừa Trong Nhà (Gia Tiên)',
    category: 'le_tet',
    lunarTriggers: [{ day: 30, month: 12 }, { day: 29, month: 12 }],
    instructions: 'Sắm lễ: Cỗ mặn hoặc cỗ chay dâng trên bàn thờ gia tiên, mâm ngũ quả, hoa tươi, trầu cau, vàng mã gia tiên.',
    prayerText: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)
Con kính lạy Hoàng thiên Hậu Thổ chư vị Tôn thần.
Con kính lạy Tổ Tiên nội ngoại chư vị Hương linh.

Tín chủ con là: ...
Ngụ tại: ...
Nhân phút giao thừa năm mới, toàn gia chúng con thành tâm dâng hương đăng hoa trà quả, kính cẩn thỉnh mời tiên tổ giáng lâm trước án thụ hưởng lễ vật, chứng giám lòng thành, phù hộ toàn gia năm mới khang ninh, vạn sự cát tường.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`,
    source: 'Văn khấn cổ truyền Việt Nam',
  },
  {
    id: 'vk_dam_gio_to_tien',
    title: 'Văn Khấn Ngày Giỗ Thường (Hung Kỵ / Cát Kỵ)',
    category: 'dam_gio',
    instructions: 'Sắm lễ: Mâm cỗ giỗ truyền thống, vàng mã cúng giỗ, hoa tươi, quả ngọt, rượu, trầu cau.',
    prayerText: `Nam mô A Di Đà Phật! (3 lần, 3 lạy)
Con kính lạy Hoàng thiên Hậu Thổ Chư vị Tôn thần.
Con kính lạy Ngài Bản cảnh Thành Hoàng, Ngài Bản xứ Thổ địa.
Con kính lạy Chư vị Tôn thần cai quản trong xứ này.
Con kính lạy Tổ Tiên nội ngoại chư vị Hương linh.

Hôm nay là ngày ... tháng ... năm ..., chính ngày Giỗ của: ...
Tín chủ con là: ... cùng toàn thể gia đình quyến thuộc.
Ngụ tại: ...
Nhân ngày húy nhật, con cháu thành tâm dâng lễ bạc tâm thành, cúi xin chư vị Tôn thần chứng giám, kính cẩn thỉnh mời hương linh hiển linh trước án, thụ hưởng lễ vật và phù hộ độ trì cho con cháu đời đời hưng vượng.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`,
    source: 'Nghi lễ thờ cúng gia tiên',
  },
];
