-- ============================================================
-- COZYGO - 50 HOMESTAY DEMO (10 ĐIỂM ĐẾN x 5 HOMESTAY)
-- Tên homestay là dữ liệu demo hư cấu.
-- Địa chỉ được mô tả theo KHU VỰC/ĐIỂM MỐC DU LỊCH THẬT.
-- Latitude/Longitude dùng tọa độ điểm mốc công cộng để hỗ trợ
-- chức năng "tìm homestay gần hoạt động".
--
-- Phân bố: 10 host demo, mỗi host đúng 5 homestay.
-- Host được nối bằng EMAIL, không hard-code user_id.
-- ============================================================

USE lvtn;
SET NAMES utf8mb4;

START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS tmp_cozygo_demo_homestays;

CREATE TEMPORARY TABLE tmp_cozygo_demo_homestays (
    host_email VARCHAR(255) NOT NULL,
    home_name VARCHAR(255) NOT NULL,
    home_address VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    home_description TEXT,
    price_per_night DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    discount_percent DECIMAL(5,2) NOT NULL,
    max_guest INT NOT NULL,
    rating_avg DECIMAL(3,2) NOT NULL,
    rating_count INT NOT NULL,
    bedroom_count INT NOT NULL,
    bathroom_count INT NOT NULL,
    kitchen_count INT NOT NULL,
    living_room_count INT NOT NULL,
    bed_count INT NOT NULL,
    checkin_time TIME NOT NULL,
    checkin_end_time TIME NOT NULL,
    checkout_start_time TIME NOT NULL,
    checkout_time TIME NOT NULL,
    PRIMARY KEY (home_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_cozygo_demo_homestays (
    host_email,
    home_name,
    home_address,
    province,
    city,
    latitude,
    longitude,
    home_description,
    price_per_night,
    status,
    discount_percent,
    max_guest,
    rating_avg,
    rating_count,
    bedroom_count,
    bathroom_count,
    kitchen_count,
    living_room_count,
    bed_count,
    checkin_time,
    checkin_end_time,
    checkout_start_time,
    checkout_time
)
VALUES
('thanhcong.phan@example.com', 'Pine & Mist House Đà Lạt', 'Khu vực Hồ Xuân Hương, Trần Quốc Toản, Đà Lạt, Lâm Đồng', 'Lâm Đồng', 'Đà Lạt', 11.9442520, 108.4474780, 'Căn homestay phong cách ấm áp gần Hồ Xuân Hương, thuận tiện đi bộ vào trung tâm, phù hợp nhóm bạn và gia đình nhỏ.', 850000.00, 'APPROVED', 5.00, 4, 4.70, 32, 2, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('hoaian.nguyen@example.com', 'Lâm Viên Garden Stay', 'Khu vực Chợ Đà Lạt, Nguyễn Thị Minh Khai, Đà Lạt, Lâm Đồng', 'Lâm Đồng', 'Đà Lạt', 11.9418100, 108.4371000, 'Không gian nghỉ dưỡng gần Chợ Đà Lạt, thiết kế sáng, có bếp và phòng khách riêng, thuận tiện khám phá khu trung tâm.', 950000.00, 'APPROVED', 8.00, 6, 4.60, 22, 3, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('quockhanh.lam@example.com', 'An Mộc Đà Lạt', 'Khu vực Dinh III Bảo Đại, 1 Triệu Việt Vương, Đà Lạt, Lâm Đồng', 'Lâm Đồng', 'Đà Lạt', 11.9300500, 108.4296700, 'Homestay yên tĩnh giữa khu biệt thự và rừng thông, phù hợp khách yêu không gian riêng tư và các điểm tham quan lịch sử.', 780000.00, 'APPROVED', 0.00, 3, 4.50, 17, 1, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('baongoc.tran@example.com', 'Royal Pine Villa Đà Lạt', 'Khu vực Dinh I Bảo Đại, Trần Quang Diệu, Đà Lạt, Lâm Đồng', 'Lâm Đồng', 'Đà Lạt', 11.9444600, 108.4698700, 'Căn nhà nguyên căn thoáng mát gần Dinh I, có sân nhỏ và không gian sinh hoạt chung cho gia đình.', 1350000.00, 'APPROVED', 10.00, 8, 4.80, 49, 3, 2, 1, 1, 4, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('minhkhoa.huynh@example.com', 'Cầu Đất Tea Hill Home', 'Khu vực Đồi chè Cầu Đất, Xuân Trường, Đà Lạt, Lâm Đồng', 'Lâm Đồng', 'Đà Lạt', 11.8777500, 108.5603400, 'Chỗ nghỉ hướng đồi chè, không khí mát và yên tĩnh, phù hợp khách thích săn mây và trải nghiệm vùng ngoại ô Đà Lạt.', 720000.00, 'APPROVED', 6.00, 5, 4.40, 16, 2, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thuha.do@example.com', 'Ninh Kiều Riverside Home', 'Khu vực Bến Ninh Kiều, Hai Bà Trưng, Ninh Kiều, Cần Thơ', 'Cần Thơ', 'Cần Thơ', 10.0349600, 105.7721700, 'Căn homestay gần bờ sông và Bến Ninh Kiều, thuận tiện ăn uống, đi bộ và khởi hành các tour sông nước.', 780000.00, 'APPROVED', 5.00, 4, 4.70, 37, 2, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('tanloc.nguyen@example.com', 'Tây Đô Floating Market Stay', 'Khu vực Chợ nổi Cái Răng, Cái Răng, Cần Thơ', 'Cần Thơ', 'Cần Thơ', 10.0050363, 105.7459816, 'Chỗ nghỉ gần tuyến tham quan Chợ nổi Cái Răng, phù hợp khách muốn trải nghiệm nhịp sống sông nước từ sáng sớm.', 650000.00, 'APPROVED', 8.00, 6, 4.60, 27, 3, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('haiyen.truong@example.com', 'Bình Thủy Heritage Home', 'Khu vực Bình Thủy, Cần Thơ', 'Cần Thơ', 'Cần Thơ', 10.0735000, 105.7389000, 'Homestay mang phong cách miền Tây, gần khu nhà cổ Bình Thủy, có không gian sinh hoạt chung và bếp đầy đủ.', 820000.00, 'APPROVED', 0.00, 3, 4.50, 15, 1, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('duclong.pham@example.com', 'Phương Nam Garden House', 'Khu vực Thiền viện Trúc Lâm Phương Nam, Mỹ Khánh, Phong Điền, Cần Thơ', 'Cần Thơ', 'Cần Thơ', 9.9896800, 105.7037200, 'Căn nhà vườn yên tĩnh gần Mỹ Khánh và Thiền viện Trúc Lâm Phương Nam, thích hợp nghỉ dưỡng gia đình.', 900000.00, 'APPROVED', 10.00, 8, 4.80, 47, 3, 2, 1, 1, 4, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thanhhuong.vo@example.com', 'Cồn Sơn Orchard Stay', 'Khu vực Cồn Sơn, Bình Thủy, Cần Thơ', 'Cần Thơ', 'Cần Thơ', 10.0845300, 105.7504800, 'Homestay phong cách vườn cây trái gần Cồn Sơn, phù hợp khách muốn trải nghiệm sinh hoạt địa phương và ẩm thực miền Tây.', 700000.00, 'APPROVED', 6.00, 5, 4.40, 14, 2, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thanhcong.phan@example.com', 'Stone Church View House Sa Pa', 'Khu trung tâm Sa Pa, gần Nhà thờ đá Sa Pa, Lào Cai', 'Lào Cai', 'Sa Pa', 22.3340300, 103.8410100, 'Chỗ nghỉ trung tâm Sa Pa, dễ đi bộ đến quảng trường và khu nhà thờ đá, phù hợp khách đi ngắn ngày.', 900000.00, 'APPROVED', 5.00, 4, 4.70, 35, 2, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('hoaian.nguyen@example.com', 'Cát Cát Valley Stay', 'Khu vực bản Cát Cát, Sa Pa, Lào Cai', 'Lào Cai', 'Sa Pa', 22.3285300, 103.8346800, 'Homestay nhìn xuống thung lũng gần bản Cát Cát, không gian gỗ ấm cúng và thuận tiện khám phá văn hóa bản địa.', 760000.00, 'APPROVED', 8.00, 6, 4.60, 25, 3, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('quockhanh.lam@example.com', 'Hàm Rồng Cloud House', 'Khu vực Hàm Rồng, Sa Pa, Lào Cai', 'Lào Cai', 'Sa Pa', 22.3608200, 103.8628900, 'Chỗ nghỉ vùng cao thoáng đãng, phù hợp khách thích khí hậu lạnh, cảnh núi và các tuyến đi bộ quanh Hàm Rồng.', 980000.00, 'APPROVED', 0.00, 3, 4.50, 20, 1, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('baongoc.tran@example.com', 'Fansipan Terrace Home', 'Khu vực Sun World Fansipan Legend, Sa Pa, Lào Cai', 'Lào Cai', 'Sa Pa', 22.3370800, 103.8243300, 'Homestay có không gian sinh hoạt chung rộng, thuận tiện di chuyển đến khu Fansipan và các điểm ngắm núi.', 1250000.00, 'APPROVED', 10.00, 8, 4.80, 52, 3, 2, 1, 1, 4, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('minhkhoa.huynh@example.com', 'Mường Hoa Mountain Home', 'Khu vực thung lũng Mường Hoa, Lao Chải, Sa Pa, Lào Cai', 'Lào Cai', 'Sa Pa', 22.3139600, 103.8735000, 'Chỗ nghỉ gần thung lũng Mường Hoa, yên tĩnh và phù hợp khách yêu trekking, ruộng bậc thang và cảnh núi.', 850000.00, 'APPROVED', 6.00, 5, 4.40, 12, 2, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thuha.do@example.com', 'Mỹ Khê Blue House', 'Khu vực bãi biển Mỹ Khê, Phước Mỹ, Sơn Trà, Đà Nẵng', 'Đà Nẵng', 'Đà Nẵng', 16.0616670, 108.2455560, 'Homestay gần biển Mỹ Khê, thiết kế hiện đại, phù hợp nhóm bạn và gia đình muốn ưu tiên hoạt động biển.', 1100000.00, 'APPROVED', 5.00, 4, 4.70, 33, 2, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('tanloc.nguyen@example.com', 'Hàn River Loft', 'Khu vực Cầu Rồng, sông Hàn, Đà Nẵng', 'Đà Nẵng', 'Đà Nẵng', 16.0611700, 108.2279000, 'Căn nguyên căn gần Cầu Rồng và sông Hàn, thuận tiện vui chơi buổi tối và khám phá trung tâm thành phố.', 1250000.00, 'APPROVED', 8.00, 6, 4.60, 23, 3, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('haiyen.truong@example.com', 'Love Bridge Riverside Stay', 'Khu vực Cầu Tình Yêu, Trần Hưng Đạo, Sơn Trà, Đà Nẵng', 'Đà Nẵng', 'Đà Nẵng', 16.0632600, 108.2296100, 'Chỗ nghỉ gần bờ đông sông Hàn và Cầu Tình Yêu, có phòng khách rộng và vị trí thuận tiện đi lại.', 1050000.00, 'APPROVED', 0.00, 3, 4.50, 18, 1, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('duclong.pham@example.com', 'Sơn Trà Sea Breeze Home', 'Khu vực chùa Linh Ứng, bán đảo Sơn Trà, Đà Nẵng', 'Đà Nẵng', 'Đà Nẵng', 16.1001400, 108.2784400, 'Homestay ở khu Sơn Trà thoáng mát, phù hợp khách yêu thiên nhiên, biển và các tuyến tham quan bán đảo.', 1450000.00, 'APPROVED', 10.00, 8, 4.80, 50, 3, 2, 1, 1, 4, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thanhhuong.vo@example.com', 'Non Nước Garden Villa', 'Khu vực Ngũ Hành Sơn, Hòa Hải, Đà Nẵng', 'Đà Nẵng', 'Đà Nẵng', 16.0039100, 108.2660300, 'Căn villa gia đình gần Ngũ Hành Sơn và Non Nước, có bếp, phòng khách và không gian nghỉ ngơi riêng tư.', 1350000.00, 'APPROVED', 6.00, 5, 4.40, 17, 2, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thanhcong.phan@example.com', 'Hoài Phố Courtyard Home', 'Khu vực Chùa Cầu, Minh An, Hội An, Quảng Nam', 'Quảng Nam', 'Hội An', 15.8771000, 108.3260100, 'Homestay phong cách nhà phố cổ, gần Chùa Cầu và sông Hoài, thuận tiện đi bộ tham quan khu di sản.', 950000.00, 'APPROVED', 5.00, 4, 4.70, 38, 2, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('hoaian.nguyen@example.com', 'Central Market Lantern House', 'Khu vực Chợ Hội An, Trần Quý Cáp, Hội An, Quảng Nam', 'Quảng Nam', 'Hội An', 15.8768000, 108.3313600, 'Căn nhà mang cảm hứng đèn lồng, nằm gần Chợ Hội An và khu phố đi bộ, phù hợp khách thích ẩm thực địa phương.', 880000.00, 'APPROVED', 8.00, 6, 4.60, 21, 3, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('quockhanh.lam@example.com', 'An Bàng Sand House', 'Khu vực biển An Bàng, Hội An, Quảng Nam', 'Quảng Nam', 'Hội An', 15.9160400, 108.3368700, 'Homestay gần biển An Bàng, không gian thoáng và phù hợp nhóm khách muốn kết hợp nghỉ biển với phố cổ.', 1100000.00, 'APPROVED', 0.00, 3, 4.50, 16, 1, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('baongoc.tran@example.com', 'Trà Quế Garden Retreat', 'Khu vực làng rau Trà Quế, Hội An, Quảng Nam', 'Quảng Nam', 'Hội An', 15.9022300, 108.3388400, 'Căn nhà vườn gần làng rau Trà Quế, phù hợp khách thích không gian xanh và trải nghiệm đời sống nông nghiệp Hội An.', 980000.00, 'APPROVED', 10.00, 8, 4.80, 48, 3, 2, 1, 1, 4, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('minhkhoa.huynh@example.com', 'Cẩm Thanh Coconut Home', 'Khu vực Cẩm Thanh, Hội An, Quảng Nam', 'Quảng Nam', 'Hội An', 15.8757000, 108.3722000, 'Homestay gần vùng dừa nước Cẩm Thanh, không gian yên tĩnh và thuận tiện tham gia các hoạt động trải nghiệm sinh thái.', 1050000.00, 'APPROVED', 6.00, 5, 4.40, 15, 2, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thuha.do@example.com', 'Hoàn Kiếm Heritage Home', 'Khu vực Hồ Hoàn Kiếm, Hoàn Kiếm, Hà Nội', 'Hà Nội', 'Hà Nội', 21.0287700, 105.8505800, 'Căn homestay trung tâm gần Hồ Hoàn Kiếm, phù hợp khách muốn đi bộ khám phá phố cổ, ẩm thực và các điểm văn hóa.', 1200000.00, 'APPROVED', 5.00, 4, 4.70, 36, 2, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('tanloc.nguyen@example.com', 'Nhà Chung Old Quarter Stay', 'Khu vực Nhà thờ Lớn, Nhà Chung, Hoàn Kiếm, Hà Nội', 'Hà Nội', 'Hà Nội', 21.0286600, 105.8488500, 'Chỗ nghỉ phong cách phố cổ gần Nhà thờ Lớn, thuận tiện đi bộ đến Hồ Gươm và khu ẩm thực trung tâm.', 1350000.00, 'APPROVED', 8.00, 6, 4.60, 26, 3, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('haiyen.truong@example.com', 'Văn Miếu Courtyard Home', 'Khu vực Văn Miếu - Quốc Tử Giám, Đống Đa, Hà Nội', 'Hà Nội', 'Hà Nội', 21.0288000, 105.8360000, 'Căn nhà yên tĩnh gần Văn Miếu, phù hợp khách yêu không gian văn hóa và muốn ở gần khu trung tâm Hà Nội.', 1100000.00, 'APPROVED', 0.00, 3, 4.50, 21, 1, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('duclong.pham@example.com', 'Trấn Quốc Lake House', 'Khu vực chùa Trấn Quốc, Tây Hồ, Hà Nội', 'Hà Nội', 'Hà Nội', 21.0479200, 105.8194900, 'Homestay gần hồ và chùa Trấn Quốc, không gian thư giãn, phù hợp khách thích đi bộ ven hồ và nghỉ dài ngày.', 1450000.00, 'APPROVED', 10.00, 8, 4.80, 46, 3, 2, 1, 1, 4, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thanhhuong.vo@example.com', 'West Lake Garden Loft', 'Khu vực Hồ Tây, Tây Hồ, Hà Nội', 'Hà Nội', 'Hà Nội', 21.0580500, 105.8238300, 'Căn loft gần Hồ Tây, có bếp và khu sinh hoạt chung, phù hợp cặp đôi hoặc khách công tác cần không gian riêng.', 1500000.00, 'APPROVED', 6.00, 5, 4.40, 13, 2, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thanhcong.phan@example.com', 'Ponagar Riverside Stay', 'Khu vực Tháp Bà Ponagar, đường 2 Tháng 4, Nha Trang, Khánh Hòa', 'Khánh Hòa', 'Nha Trang', 12.2652800, 109.1953000, 'Homestay gần Tháp Bà Ponagar và sông Cái, thuận tiện kết hợp tham quan văn hóa với nghỉ biển.', 1000000.00, 'APPROVED', 5.00, 4, 4.70, 34, 2, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('hoaian.nguyen@example.com', 'Hòn Chồng Breeze House', 'Khu vực Hòn Chồng, Vĩnh Phước, Nha Trang, Khánh Hòa', 'Khánh Hòa', 'Nha Trang', 12.2728300, 109.2064600, 'Chỗ nghỉ gần Hòn Chồng, đón gió biển và phù hợp khách muốn ở khu phía bắc Nha Trang yên tĩnh hơn trung tâm.', 1100000.00, 'APPROVED', 8.00, 6, 4.60, 24, 3, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('quockhanh.lam@example.com', 'Đầm Market City Home', 'Khu vực Chợ Đầm, Nha Trang, Khánh Hòa', 'Khánh Hòa', 'Nha Trang', 12.2549380, 109.1918100, 'Căn homestay gần Chợ Đầm, thuận tiện mua sắm, ăn uống và di chuyển đến các điểm tham quan trung tâm.', 950000.00, 'APPROVED', 0.00, 3, 4.50, 19, 1, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('baongoc.tran@example.com', 'Trần Phú Sea View Home', 'Khu vực Quảng trường 2/4 - Trần Phú, Nha Trang, Khánh Hòa', 'Khánh Hòa', 'Nha Trang', 12.2452400, 109.1963900, 'Homestay gần trục Trần Phú và quảng trường biển, phù hợp khách ưu tiên vị trí trung tâm và các hoạt động ven biển.', 1250000.00, 'APPROVED', 10.00, 8, 4.80, 51, 3, 2, 1, 1, 4, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('minhkhoa.huynh@example.com', 'Cảnh Long Bay House', 'Khu vực phía nam Nha Trang, gần Cầu Bình Tân - Phước Long, Khánh Hòa', 'Khánh Hòa', 'Nha Trang', 12.2083500, 109.1887000, 'Căn nhà nguyên căn ở khu phía nam thành phố, không gian rộng và thuận tiện di chuyển đến cả trung tâm lẫn khu ven biển.', 900000.00, 'APPROVED', 6.00, 5, 4.40, 18, 2, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thuha.do@example.com', 'Dinh Cậu Sunset Home', 'Khu vực Dinh Cậu, Dương Đông, Phú Quốc, Kiên Giang', 'Kiên Giang', 'Phú Quốc', 10.2163000, 103.9588000, 'Homestay gần Dinh Cậu và trung tâm Dương Đông, thuận tiện ngắm hoàng hôn, ăn uống và di chuyển quanh đảo.', 1350000.00, 'APPROVED', 5.00, 4, 4.70, 32, 2, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('tanloc.nguyen@example.com', 'Dương Đông Night Market Stay', 'Khu vực Chợ đêm Phú Quốc, Dương Đông, Phú Quốc, Kiên Giang', 'Kiên Giang', 'Phú Quốc', 10.2163000, 103.9605800, 'Chỗ nghỉ gần Chợ đêm Phú Quốc, phù hợp khách muốn trải nghiệm ẩm thực buổi tối và ở gần trung tâm.', 1250000.00, 'APPROVED', 8.00, 6, 4.60, 22, 3, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('haiyen.truong@example.com', 'Bãi Trường Sunset House', 'Khu vực Bãi Trường, Trần Hưng Đạo, Phú Quốc, Kiên Giang', 'Kiên Giang', 'Phú Quốc', 10.1143500, 103.9809300, 'Homestay gần Bãi Trường, không gian nghỉ dưỡng thoáng, phù hợp gia đình và nhóm bạn yêu biển.', 1600000.00, 'APPROVED', 0.00, 3, 4.50, 17, 1, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('duclong.pham@example.com', 'Grand World Lagoon Home', 'Khu vực Grand World, Gành Dầu, Phú Quốc, Kiên Giang', 'Kiên Giang', 'Phú Quốc', 10.3255800, 103.8579400, 'Căn nghỉ dưỡng gần khu Grand World, phù hợp khách ưu tiên vui chơi giải trí và các hoạt động ở bắc đảo.', 1850000.00, 'APPROVED', 10.00, 8, 4.80, 49, 3, 2, 1, 1, 4, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thanhhuong.vo@example.com', 'Ông Lang Tropical House', 'Khu vực bãi Ông Lang, Phú Quốc, Kiên Giang', 'Kiên Giang', 'Phú Quốc', 10.2573900, 103.9367100, 'Homestay phong cách nhiệt đới gần bãi Ông Lang, yên tĩnh và phù hợp khách muốn nghỉ dưỡng dài ngày.', 1450000.00, 'APPROVED', 6.00, 5, 4.40, 16, 2, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thanhcong.phan@example.com', 'Tây Bắc Square Home', 'Khu vực Quảng trường Tây Bắc, thành phố Sơn La, Sơn La', 'Sơn La', 'Sơn La', 21.3233900, 103.9120800, 'Homestay trung tâm gần Quảng trường Tây Bắc, thuận tiện đi lại, ăn uống và khám phá thành phố Sơn La.', 620000.00, 'APPROVED', 5.00, 4, 4.70, 37, 2, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('hoaian.nguyen@example.com', 'Tô Hiệu Heritage Stay', 'Khu vực di tích Nhà tù Sơn La, thành phố Sơn La, Sơn La', 'Sơn La', 'Sơn La', 21.3310600, 103.9079100, 'Chỗ nghỉ gần khu di tích lịch sử Sơn La, không gian gọn gàng và phù hợp khách công tác hoặc du lịch văn hóa.', 680000.00, 'APPROVED', 8.00, 6, 4.60, 27, 3, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('quockhanh.lam@example.com', 'Tây Bắc University Loft', 'Khu vực Đại học Tây Bắc, thành phố Sơn La, Sơn La', 'Sơn La', 'Sơn La', 21.3109300, 103.9412200, 'Căn loft ở khu phía đông thành phố, phù hợp khách trẻ, nhóm nhỏ và khách công tác dài ngày.', 590000.00, 'APPROVED', 0.00, 3, 4.50, 15, 1, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('baongoc.tran@example.com', 'Sơn La Transit Home', 'Khu vực Bến xe Sơn La, thành phố Sơn La, Sơn La', 'Sơn La', 'Sơn La', 21.3014100, 103.9434400, 'Homestay gần bến xe, thuận tiện trung chuyển đi các huyện và phù hợp khách cần lịch trình linh hoạt.', 550000.00, 'APPROVED', 10.00, 8, 4.80, 47, 3, 2, 1, 1, 4, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('minhkhoa.huynh@example.com', 'Sơn La Valley House', 'Khu vực trung tâm thành phố Sơn La, Sơn La', 'Sơn La', 'Sơn La', 21.3256000, 103.9188000, 'Căn nhà nguyên căn nhìn về thung lũng đô thị, có bếp và phòng khách, phù hợp gia đình hoặc nhóm bạn.', 720000.00, 'APPROVED', 6.00, 5, 4.40, 14, 2, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thuha.do@example.com', 'Km0 Gateway Home', 'Khu vực Cột mốc số 0, Quốc lộ 4C, thành phố Hà Giang, Hà Giang', 'Hà Giang', 'Hà Giang', 22.8265000, 104.9846000, 'Homestay gần điểm Km0, thuận tiện bắt đầu hành trình khám phá cao nguyên đá và các tuyến phía bắc Hà Giang.', 650000.00, 'APPROVED', 5.00, 4, 4.70, 35, 2, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('tanloc.nguyen@example.com', '26/3 Riverside Stay', 'Khu vực Quảng trường 26/3, Nguyễn Trãi, thành phố Hà Giang, Hà Giang', 'Hà Giang', 'Hà Giang', 22.8265930, 104.9838173, 'Chỗ nghỉ ngay khu trung tâm gần Quảng trường 26/3, thuận tiện ăn uống, thuê xe và chuẩn bị hành trình.', 720000.00, 'APPROVED', 8.00, 6, 4.60, 25, 3, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('haiyen.truong@example.com', 'Núi Cấm Panorama House', 'Khu vực Núi Cấm, thành phố Hà Giang, Hà Giang', 'Hà Giang', 'Hà Giang', 22.8241660, 104.9813022, 'Homestay ở khu trung tâm nhưng có không gian yên tĩnh, phù hợp khách thích ngắm cảnh thành phố và nghỉ trước chuyến đi dài.', 780000.00, 'APPROVED', 0.00, 3, 4.50, 20, 1, 1, 1, 1, 2, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('duclong.pham@example.com', 'Phương Thiện Road Home', 'Khu vực Bến xe Hà Giang - Phương Thiện, thành phố Hà Giang, Hà Giang', 'Hà Giang', 'Hà Giang', 22.8021100, 104.9776800, 'Căn nhà gần bến xe Hà Giang, thuận tiện nhận xe, trung chuyển và khởi hành sớm đi Quản Bạ - Đồng Văn.', 580000.00, 'APPROVED', 10.00, 8, 4.80, 52, 3, 2, 1, 1, 4, '14:00:00', '20:00:00', '08:00:00', '12:00:00'),
('thanhhuong.vo@example.com', 'Thái Hà Mountain Stay', 'Khu vực Thái Hà, thành phố Hà Giang, Hà Giang', 'Hà Giang', 'Hà Giang', 22.8489600, 105.0146200, 'Homestay ở khu ven thành phố, cảnh núi thoáng và yên tĩnh, phù hợp khách muốn tránh khu trung tâm đông đúc.', 700000.00, 'APPROVED', 6.00, 5, 4.40, 12, 2, 2, 1, 1, 3, '14:00:00', '20:00:00', '08:00:00', '12:00:00');

-- ------------------------------------------------------------
-- Kiểm tra đủ 10 host trước khi insert.
-- Nếu một email chưa tồn tại, dòng đó sẽ xuất hiện ở đây.
-- ------------------------------------------------------------
SELECT DISTINCT t.host_email AS missing_host_email
FROM tmp_cozygo_demo_homestays t
LEFT JOIN users u
       ON LOWER(u.email) = LOWER(t.host_email)
      AND u.role_id = 2
      AND u.deleted_at IS NULL
WHERE u.user_id IS NULL;

-- ------------------------------------------------------------
-- Insert vào homestays.
-- NOT EXISTS giúp chạy lại script mà không tạo trùng tên.
-- APPROVED để dữ liệu dùng được ngay cho tìm kiếm / chatbot gần hoạt động.
-- ------------------------------------------------------------
INSERT INTO homestays (
    user_id,
    home_name,
    home_address,
    province,
    city,
    latitude,
    longitude,
    home_description,
    price_per_night,
    status,
    discount_percent,
    max_guest,
    rating_avg,
    rating_count,
    bedroom_count,
    bathroom_count,
    kitchen_count,
    living_room_count,
    bed_count,
    checkin_time,
    checkin_end_time,
    checkout_start_time,
    checkout_time,
    created_at,
    updated_at,
    deleted_at
)
SELECT
    u.user_id,
    t.home_name,
    t.home_address,
    t.province,
    t.city,
    t.latitude,
    t.longitude,
    t.home_description,
    t.price_per_night,
    t.status,
    t.discount_percent,
    t.max_guest,
    t.rating_avg,
    t.rating_count,
    t.bedroom_count,
    t.bathroom_count,
    t.kitchen_count,
    t.living_room_count,
    t.bed_count,
    t.checkin_time,
    t.checkin_end_time,
    t.checkout_start_time,
    t.checkout_time,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    NULL
FROM tmp_cozygo_demo_homestays t
JOIN users u
  ON LOWER(u.email) = LOWER(t.host_email)
 AND u.role_id = 2
 AND u.deleted_at IS NULL
WHERE NOT EXISTS (
    SELECT 1
    FROM homestays h
    WHERE LOWER(h.home_name) = LOWER(t.home_name)
);

COMMIT;

-- ============================================================
-- KIỂM TRA SAU KHI INSERT
-- ============================================================

-- Mỗi điểm đến phải có 5 homestay demo.
SELECT
    h.city,
    COUNT(*) AS so_homestay_demo
FROM homestays h
JOIN tmp_cozygo_demo_homestays t
  ON t.home_name = h.home_name
GROUP BY h.city
ORDER BY h.city;

-- Mỗi host demo phải được phân đúng 5 homestay.
SELECT
    u.user_id,
    u.full_name,
    u.email,
    COUNT(*) AS so_homestay_duoc_phan
FROM users u
JOIN homestays h ON h.user_id = u.user_id
JOIN tmp_cozygo_demo_homestays t ON t.home_name = h.home_name
GROUP BY u.user_id, u.full_name, u.email
ORDER BY u.user_id;

-- Kiểm tra tọa độ và dữ liệu chính.
SELECT
    h.home_id,
    u.full_name AS host_name,
    h.home_name,
    h.city,
    h.province,
    h.latitude,
    h.longitude,
    h.price_per_night,
    h.rating_avg,
    h.checkin_time,
    h.checkin_end_time,
    h.checkout_start_time,
    h.checkout_time,
    h.status
FROM homestays h
JOIN users u ON u.user_id = h.user_id
JOIN tmp_cozygo_demo_homestays t ON t.home_name = h.home_name
ORDER BY h.city, h.home_id;
