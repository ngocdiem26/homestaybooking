-- ============================================================
-- COZYGO - GÁN CÙNG TIỆN NGHI + DỊCH VỤ + NỘI QUY
-- CHO 50 HOMESTAY DEMO
--
-- Mục tiêu:
--   50 homestay đều có:
--   - 11 tiện nghi
--   - 6 dịch vụ
--   - 7 nội quy
--
-- Script có thể chạy lại:
--   xóa dữ liệu liên kết cũ của đúng 50 homestay demo,
--   sau đó tạo lại đồng nhất.
-- ============================================================

USE lvtn;
SET NAMES utf8mb4;

ROLLBACK;

SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS tmp_50_demo_homes;

CREATE TEMPORARY TABLE tmp_50_demo_homes (
    demo_no INT NOT NULL PRIMARY KEY,
    home_name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_50_demo_homes (demo_no, home_name)
VALUES
(1, 'Pine & Mist House Đà Lạt'),
(2, 'Lâm Viên Garden Stay'),
(3, 'An Mộc Đà Lạt'),
(4, 'Royal Pine Villa Đà Lạt'),
(5, 'Cầu Đất Tea Hill Home'),
(6, 'Ninh Kiều Riverside Home'),
(7, 'Tây Đô Floating Market Stay'),
(8, 'Bình Thủy Heritage Home'),
(9, 'Phương Nam Garden House'),
(10, 'Cồn Sơn Orchard Stay'),
(11, 'Stone Church View House Sa Pa'),
(12, 'Cát Cát Valley Stay'),
(13, 'Hàm Rồng Cloud House'),
(14, 'Fansipan Terrace Home'),
(15, 'Mường Hoa Mountain Home'),
(16, 'Mỹ Khê Blue House'),
(17, 'Hàn River Loft'),
(18, 'Love Bridge Riverside Stay'),
(19, 'Sơn Trà Sea Breeze Home'),
(20, 'Non Nước Garden Villa'),
(21, 'Hoài Phố Courtyard Home'),
(22, 'Central Market Lantern House'),
(23, 'An Bàng Sand House'),
(24, 'Trà Quế Garden Retreat'),
(25, 'Cẩm Thanh Coconut Home'),
(26, 'Hoàn Kiếm Heritage Home'),
(27, 'Nhà Chung Old Quarter Stay'),
(28, 'Văn Miếu Courtyard Home'),
(29, 'Trấn Quốc Lake House'),
(30, 'West Lake Garden Loft'),
(31, 'Ponagar Riverside Stay'),
(32, 'Hòn Chồng Breeze House'),
(33, 'Đầm Market City Home'),
(34, 'Trần Phú Sea View Home'),
(35, 'Cảnh Long Bay House'),
(36, 'Dinh Cậu Sunset Home'),
(37, 'Dương Đông Night Market Stay'),
(38, 'Bãi Trường Sunset House'),
(39, 'Grand World Lagoon Home'),
(40, 'Ông Lang Tropical House'),
(41, 'Tây Bắc Square Home'),
(42, 'Tô Hiệu Heritage Stay'),
(43, 'Tây Bắc University Loft'),
(44, 'Sơn La Transit Home'),
(45, 'Sơn La Valley House'),
(46, 'Km0 Gateway Home'),
(47, '26/3 Riverside Stay'),
(48, 'Núi Cấm Panorama House'),
(49, 'Phương Thiện Road Home'),
(50, 'Thái Hà Mountain Stay');

-- ============================================================
-- 0. KIỂM TRA 50 HOMESTAY CÓ ĐỦ KHÔNG
-- Query này PHẢI trả 0 dòng.
-- ============================================================
SELECT
    t.demo_no,
    t.home_name AS missing_home_name
FROM tmp_50_demo_homes t
LEFT JOIN homestays h
       ON LOWER(TRIM(h.home_name)) = LOWER(TRIM(t.home_name))
      AND h.deleted_at IS NULL
WHERE h.home_id IS NULL
ORDER BY t.demo_no;


-- ============================================================
-- 1. TIỆN NGHI
-- Dùng toàn bộ 11 tiện nghi đang có trong bảng amenities.
-- ============================================================

-- Xóa tiện nghi cũ của đúng 50 homestay demo.
DELETE ha
FROM homestay_amenities ha
JOIN homestays h
  ON h.home_id = ha.home_id
JOIN tmp_50_demo_homes t
  ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
WHERE h.deleted_at IS NULL;

-- Gán toàn bộ tiện nghi đang có cho cả 50 homestay.
INSERT INTO homestay_amenities (
    home_id,
    amenity_id
)
SELECT
    h.home_id,
    a.amenity_id
FROM tmp_50_demo_homes t
JOIN homestays h
  ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
 AND h.deleted_at IS NULL
CROSS JOIN amenities a;


-- ============================================================
-- 2. DỊCH VỤ
-- Cùng 6 dịch vụ, cùng giá và cùng đơn vị tính.
--
-- service_id hiện tại:
-- 1 Tiệc BBQ ngoài trời     350.000 / lần
-- 2 Thuê xe máy             120.000 / ngày
-- 3 Đưa đón sân bay         450.000 / lần
-- 4 Dọn phòng hằng ngày     150.000 / ngày
-- 5 Giặt sấy                 50.000 / lần
-- 6 Cho thuê dàn loa         500.000 / ngày
-- ============================================================

-- Xóa dịch vụ cũ của đúng 50 homestay demo.
DELETE hs
FROM homestay_services hs
JOIN homestays h
  ON h.home_id = hs.home_id
JOIN tmp_50_demo_homes t
  ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
WHERE hs.homestay_service_id > 0
  AND h.deleted_at IS NULL;

-- Tạo lại 6 dịch vụ giống nhau cho tất cả 50 homestay.
INSERT INTO homestay_services (
    service_id,
    home_id,
    price,
    pricing_unit,
    status,
    created_at
)
SELECT
    service_data.service_id,
    h.home_id,
    service_data.price,
    service_data.pricing_unit,
    'APPROVED',
    CURRENT_TIMESTAMP
FROM tmp_50_demo_homes t
JOIN homestays h
  ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
 AND h.deleted_at IS NULL
CROSS JOIN (
    SELECT 1 AS service_id, 350000.00 AS price, 'PER_USE' AS pricing_unit
    UNION ALL
    SELECT 2, 120000.00, 'PER_DAY'
    UNION ALL
    SELECT 3, 450000.00, 'PER_USE'
    UNION ALL
    SELECT 4, 150000.00, 'PER_DAY'
    UNION ALL
    SELECT 5,  50000.00, 'PER_USE'
    UNION ALL
    SELECT 6, 500000.00, 'PER_DAY'
) service_data;


-- ============================================================
-- 3. NỘI QUY
-- Cùng 7 quy tắc cho tất cả 50 homestay.
-- ============================================================

-- Xóa nội quy cũ của đúng 50 homestay demo.
DELETE r
FROM rules r
JOIN homestays h
  ON h.home_id = r.home_id
JOIN tmp_50_demo_homes t
  ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
WHERE r.rule_id > 0
  AND h.deleted_at IS NULL;

-- Tạo lại 7 nội quy giống nhau.
INSERT INTO rules (
    home_id,
    rule_content,
    created_at,
    updated_at
)
SELECT
    h.home_id,
    rule_data.rule_content,
    CURRENT_TIMESTAMP,
    NULL
FROM tmp_50_demo_homes t
JOIN homestays h
  ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
 AND h.deleted_at IS NULL
CROSS JOIN (
    SELECT 'Không hút thuốc trong phòng' AS rule_content
    UNION ALL
    SELECT 'Không mang thú cưng'
    UNION ALL
    SELECT 'Không xả rác trong khuôn viên'
    UNION ALL
    SELECT 'Xuất trình giấy tờ tùy thân khi nhận phòng'
    UNION ALL
    SELECT 'Bồi thường nếu làm hư hỏng tài sản'
    UNION ALL
    SELECT 'Không tự ý di chuyển nội thất'
    UNION ALL
    SELECT 'Giữ yên lặng sau 22:00'
) rule_data;


COMMIT;

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;


-- ============================================================
-- 4. KIỂM TRA KẾT QUẢ
-- ============================================================

-- Mỗi homestay phải có:
-- amenity_count = số dòng hiện có trong amenities (ảnh của bạn là 11)
-- service_count = 6
-- rule_count = 7
SELECT
    t.demo_no,
    h.home_id,
    h.home_name,
    (SELECT COUNT(*)
       FROM homestay_amenities ha
      WHERE ha.home_id = h.home_id) AS amenity_count,
    (SELECT COUNT(*)
       FROM homestay_services hs
      WHERE hs.home_id = h.home_id) AS service_count,
    (SELECT COUNT(*)
       FROM rules r
      WHERE r.home_id = h.home_id) AS rule_count
FROM tmp_50_demo_homes t
JOIN homestays h
  ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
ORDER BY t.demo_no;


-- Tổng số liên kết dự kiến:
-- 50 * 11 = 550 tiện nghi   (nếu amenities hiện có đúng 11 dòng)
-- 50 *  6 = 300 dịch vụ
-- 50 *  7 = 350 nội quy
SELECT
    (SELECT COUNT(*)
       FROM homestay_amenities ha
       JOIN homestays h ON h.home_id = ha.home_id
       JOIN tmp_50_demo_homes t
         ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
    ) AS total_amenity_links,

    (SELECT COUNT(*)
       FROM homestay_services hs
       JOIN homestays h ON h.home_id = hs.home_id
       JOIN tmp_50_demo_homes t
         ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
    ) AS total_service_links,

    (SELECT COUNT(*)
       FROM rules r
       JOIN homestays h ON h.home_id = r.home_id
       JOIN tmp_50_demo_homes t
         ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
    ) AS total_rule_links;


-- Kiểm tra chi tiết dịch vụ.
SELECT
    h.home_id,
    h.home_name,
    s.service_name,
    hs.price,
    hs.pricing_unit,
    hs.status
FROM tmp_50_demo_homes t
JOIN homestays h
  ON LOWER(TRIM(t.home_name)) = LOWER(TRIM(h.home_name))
JOIN homestay_services hs
  ON hs.home_id = h.home_id
JOIN services s
  ON s.service_id = hs.service_id
ORDER BY t.demo_no, s.service_id;
