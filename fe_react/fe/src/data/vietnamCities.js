const CITY_PROVINCE_PAIRS = [
  ['Hà Nội', 'Hà Nội'],
  ['Thành phố Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
  ['TP HCM', 'Thành phố Hồ Chí Minh'],
  ['Hồ Chí Minh', 'Thành phố Hồ Chí Minh'],
  ['Thủ Đức', 'Thành phố Hồ Chí Minh'],
  ['Hải Phòng', 'Hải Phòng'],
  ['Thủy Nguyên', 'Hải Phòng'],
  ['Đà Nẵng', 'Đà Nẵng'],
  ['Cần Thơ', 'Cần Thơ'],
  ['Huế', 'Huế'],
  ['Vĩnh Phúc', 'Vĩnh Phúc'],
  ['Phúc Yên', 'Vĩnh Phúc'],
  ['Vĩnh Yên', 'Vĩnh Phúc'],
  ['Bắc Ninh', 'Bắc Ninh'],
  ['Từ Sơn', 'Bắc Ninh'],
  ['Quảng Ninh', 'Quảng Ninh'],
  ['Hạ Long', 'Quảng Ninh'],
  ['Uông Bí', 'Quảng Ninh'],
  ['Cẩm Phả', 'Quảng Ninh'],
  ['Móng Cái', 'Quảng Ninh'],
  ['Đông Triều', 'Quảng Ninh'],
  ['Hải Dương', 'Hải Dương'],
  ['Chí Linh', 'Hải Dương'],
  ['Hưng Yên', 'Hưng Yên'],
  ['Thái Bình', 'Thái Bình'],
  ['Hà Nam', 'Hà Nam'],
  ['Phủ Lý', 'Hà Nam'],
  ['Nam Định', 'Nam Định'],
  ['Ninh Bình', 'Ninh Bình'],
  ['Hoa Lư', 'Ninh Bình'],
  ['Tam Điệp', 'Ninh Bình'],
  ['Hà Giang', 'Hà Giang'],
  ['Cao Bằng', 'Cao Bằng'],
  ['Bắc Kạn', 'Bắc Kạn'],
  ['Tuyên Quang', 'Tuyên Quang'],
  ['Lào Cai', 'Lào Cai'],
  ['Sa Pa', 'Lào Cai'],
  ['Yên Bái', 'Yên Bái'],
  ['Thái Nguyên', 'Thái Nguyên'],
  ['Sông Công', 'Thái Nguyên'],
  ['Phổ Yên', 'Thái Nguyên'],
  ['Lạng Sơn', 'Lạng Sơn'],
  ['Bắc Giang', 'Bắc Giang'],
  ['Phú Thọ', 'Phú Thọ'],
  ['Việt Trì', 'Phú Thọ'],
  ['Điện Biên', 'Điện Biên'],
  ['Điện Biên Phủ', 'Điện Biên'],
  ['Lai Châu', 'Lai Châu'],
  ['Sơn La', 'Sơn La'],
  ['Mộc Châu', 'Sơn La'],
  ['Hòa Bình', 'Hòa Bình'],
  ['Thanh Hóa', 'Thanh Hóa'],
  ['Sầm Sơn', 'Thanh Hóa'],
  ['Nghệ An', 'Nghệ An'],
  ['Vinh', 'Nghệ An'],
  ['Hà Tĩnh', 'Hà Tĩnh'],
  ['Quảng Bình', 'Quảng Bình'],
  ['Đồng Hới', 'Quảng Bình'],
  ['Quảng Trị', 'Quảng Trị'],
  ['Đông Hà', 'Quảng Trị'],
  ['Quảng Nam', 'Quảng Nam'],
  ['Tam Kỳ', 'Quảng Nam'],
  ['Hội An', 'Quảng Nam'],
  ['Quảng Ngãi', 'Quảng Ngãi'],
  ['Bình Định', 'Bình Định'],
  ['Quy Nhơn', 'Bình Định'],
  ['Phú Yên', 'Phú Yên'],
  ['Tuy Hòa', 'Phú Yên'],
  ['Khánh Hòa', 'Khánh Hòa'],
  ['Nha Trang', 'Khánh Hòa'],
  ['Cam Ranh', 'Khánh Hòa'],
  ['Ninh Thuận', 'Ninh Thuận'],
  ['Phan Rang - Tháp Chàm', 'Ninh Thuận'],
  ['Bình Thuận', 'Bình Thuận'],
  ['Phan Thiết', 'Bình Thuận'],
  ['Kon Tum', 'Kon Tum'],
  ['Gia Lai', 'Gia Lai'],
  ['Pleiku', 'Gia Lai'],
  ['Đắk Lắk', 'Đắk Lắk'],
  ['Buôn Ma Thuột', 'Đắk Lắk'],
  ['Đắk Nông', 'Đắk Nông'],
  ['Gia Nghĩa', 'Đắk Nông'],
  ['Lâm Đồng', 'Lâm Đồng'],
  ['Đà Lạt', 'Lâm Đồng'],
  ['Bảo Lộc', 'Lâm Đồng'],
  ['Bình Phước', 'Bình Phước'],
  ['Đồng Xoài', 'Bình Phước'],
  ['Tây Ninh', 'Tây Ninh'],
  ['Bình Dương', 'Bình Dương'],
  ['Thủ Dầu Một', 'Bình Dương'],
  ['Dĩ An', 'Bình Dương'],
  ['Thuận An', 'Bình Dương'],
  ['Tân Uyên', 'Bình Dương'],
  ['Bến Cát', 'Bình Dương'],
  ['Đồng Nai', 'Đồng Nai'],
  ['Biên Hòa', 'Đồng Nai'],
  ['Long Khánh', 'Đồng Nai'],
  ['Bà Rịa - Vũng Tàu', 'Bà Rịa - Vũng Tàu'],
  ['Vũng Tàu', 'Bà Rịa - Vũng Tàu'],
  ['Bà Rịa', 'Bà Rịa - Vũng Tàu'],
  ['Phú Mỹ', 'Bà Rịa - Vũng Tàu'],
  ['Long An', 'Long An'],
  ['Tân An', 'Long An'],
  ['Tiền Giang', 'Tiền Giang'],
  ['Mỹ Tho', 'Tiền Giang'],
  ['Gò Công', 'Tiền Giang'],
  ['Bến Tre', 'Bến Tre'],
  ['Trà Vinh', 'Trà Vinh'],
  ['Vĩnh Long', 'Vĩnh Long'],
  ['Đồng Tháp', 'Đồng Tháp'],
  ['Cao Lãnh', 'Đồng Tháp'],
  ['Sa Đéc', 'Đồng Tháp'],
  ['Hồng Ngự', 'Đồng Tháp'],
  ['An Giang', 'An Giang'],
  ['Long Xuyên', 'An Giang'],
  ['Châu Đốc', 'An Giang'],
  ['Kiên Giang', 'Kiên Giang'],
  ['Rạch Giá', 'Kiên Giang'],
  ['Phú Quốc', 'Kiên Giang'],
  ['Hà Tiên', 'Kiên Giang'],
  ['Hậu Giang', 'Hậu Giang'],
  ['Vị Thanh', 'Hậu Giang'],
  ['Ngã Bảy', 'Hậu Giang'],
  ['Sóc Trăng', 'Sóc Trăng'],
  ['Bạc Liêu', 'Bạc Liêu'],
  ['Cà Mau', 'Cà Mau'],
];

export const VIETNAM_PROVINCES = [
  'Hà Nội', 'Thành phố Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ', 'Huế',
  'Vĩnh Phúc', 'Bắc Ninh', 'Quảng Ninh', 'Hải Dương', 'Hưng Yên', 'Thái Bình',
  'Hà Nam', 'Nam Định', 'Ninh Bình', 'Hà Giang', 'Cao Bằng', 'Bắc Kạn',
  'Tuyên Quang', 'Lào Cai', 'Yên Bái', 'Thái Nguyên', 'Lạng Sơn', 'Bắc Giang',
  'Phú Thọ', 'Điện Biên', 'Lai Châu', 'Sơn La', 'Hòa Bình', 'Thanh Hóa',
  'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Quảng Nam', 'Quảng Ngãi',
  'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Kon Tum',
  'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng', 'Bình Phước', 'Tây Ninh',
  'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu', 'Long An', 'Tiền Giang',
  'Bến Tre', 'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang',
  'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau',
];

export const VIETNAM_CITY_PROVINCE_MAP = CITY_PROVINCE_PAIRS.reduce((accumulator, [city, province]) => {
  accumulator[city] = province;
  return accumulator;
}, {});

export const VIETNAM_CITIES = CITY_PROVINCE_PAIRS.map(([city]) => city);

export function normalizeVietnamese(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/\b(tp|tp\.|thanh pho|tinh)\b/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const NORMALIZED_CITY_PROVINCE_MAP = CITY_PROVINCE_PAIRS.reduce((accumulator, [city, province]) => {
  accumulator[normalizeVietnamese(city)] = { city, province };
  return accumulator;
}, {});

const CITY_ALIASES = {
  dalat: 'Đà Lạt',
  'da lat': 'Đà Lạt',
  cantho: 'Cần Thơ',
  'can tho': 'Cần Thơ',
  sapa: 'Sa Pa',
  'sa pa': 'Sa Pa',
  hoian: 'Hội An',
  'hoi an': 'Hội An',
  danang: 'Đà Nẵng',
  'da nang': 'Đà Nẵng',
  nhatrang: 'Nha Trang',
  'nha trang': 'Nha Trang',
  phuquoc: 'Phú Quốc',
  'phu quoc': 'Phú Quốc',
  halong: 'Hạ Long',
  'ha long': 'Hạ Long',
  hochiminh: 'Thành phố Hồ Chí Minh',
  'ho chi minh': 'Thành phố Hồ Chí Minh',
  hcm: 'TP HCM',
  tphcm: 'TP HCM',
  'tp hcm': 'TP HCM',
  saigon: 'TP HCM',
  'sai gon': 'TP HCM',
};

export function resolveCityProvince(city) {
  const raw = city?.trim() || '';
  if (!raw) return { city: '', province: '' };

  const directProvince = VIETNAM_CITY_PROVINCE_MAP[raw];
  if (directProvince) return { city: raw, province: directProvince };

  const normalized = normalizeVietnamese(raw);
  const aliasedCity = CITY_ALIASES[normalized];
  if (aliasedCity) {
    return { city: aliasedCity, province: VIETNAM_CITY_PROVINCE_MAP[aliasedCity] || '' };
  }

  const normalizedMatch = NORMALIZED_CITY_PROVINCE_MAP[normalized];
  if (normalizedMatch) return normalizedMatch;

  return { city: raw, province: '' };
}

export function getProvinceByCity(city) {
  return resolveCityProvince(city).province || city || '';
}

