-- ============================================================
-- COZYGO - GẮN 6 ẢNH CHO 50 HOMESTAY DEMO
--
-- Cấu trúc thư mục frontend:
-- fe/public/images/homestay/H1/
-- fe/public/images/homestay/H2/
-- ...
-- fe/public/images/homestay/H50/
--
-- Mỗi thư mục phải có đúng 6 file:
--   chinh.jpg       -> ảnh chính
--   phongkhach.jpg
--   phongngu.jpg
--   phongtam.jpg
--   bep.jpg
--   sanvuon.jpg
--
-- Trong DB chỉ lưu URL public:
--   /images/homestay/H1/chinh.jpg
--
-- KHÔNG lưu:
--   D:\...\public\images\...
--   http://localhost:5173/...
-- vì URL tương đối /images/... chạy đúng cả dev và khi deploy frontend.
-- ============================================================

USE lvtn;
SET NAMES utf8mb4;

-- ============================================================
-- SAFE UPDATE FIX
-- Lưu trạng thái Safe Updates hiện tại, tắt tạm thời cho script,
-- sau đó khôi phục lại ở cuối file.
-- ROLLBACK giúp dọn transaction dở nếu lần chạy trước bị lỗi.
-- ============================================================
ROLLBACK;

SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS tmp_demo_homestay_image_map;

CREATE TEMPORARY TABLE tmp_demo_homestay_image_map (
    demo_no INT NOT NULL PRIMARY KEY,
    home_name VARCHAR(255) NOT NULL,
    folder_name VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_demo_homestay_image_map (demo_no, home_name, folder_name)
VALUES
(1, 'Pine & Mist House Đà Lạt', 'H1'),
(2, 'Lâm Viên Garden Stay', 'H2'),
(3, 'An Mộc Đà Lạt', 'H3'),
(4, 'Royal Pine Villa Đà Lạt', 'H4'),
(5, 'Cầu Đất Tea Hill Home', 'H5'),
(6, 'Ninh Kiều Riverside Home', 'H6'),
(7, 'Tây Đô Floating Market Stay', 'H7'),
(8, 'Bình Thủy Heritage Home', 'H8'),
(9, 'Phương Nam Garden House', 'H9'),
(10, 'Cồn Sơn Orchard Stay', 'H10'),
(11, 'Stone Church View House Sa Pa', 'H11'),
(12, 'Cát Cát Valley Stay', 'H12'),
(13, 'Hàm Rồng Cloud House', 'H13'),
(14, 'Fansipan Terrace Home', 'H14'),
(15, 'Mường Hoa Mountain Home', 'H15'),
(16, 'Mỹ Khê Blue House', 'H16'),
(17, 'Hàn River Loft', 'H17'),
(18, 'Love Bridge Riverside Stay', 'H18'),
(19, 'Sơn Trà Sea Breeze Home', 'H19'),
(20, 'Non Nước Garden Villa', 'H20'),
(21, 'Hoài Phố Courtyard Home', 'H21'),
(22, 'Central Market Lantern House', 'H22'),
(23, 'An Bàng Sand House', 'H23'),
(24, 'Trà Quế Garden Retreat', 'H24'),
(25, 'Cẩm Thanh Coconut Home', 'H25'),
(26, 'Hoàn Kiếm Heritage Home', 'H26'),
(27, 'Nhà Chung Old Quarter Stay', 'H27'),
(28, 'Văn Miếu Courtyard Home', 'H28'),
(29, 'Trấn Quốc Lake House', 'H29'),
(30, 'West Lake Garden Loft', 'H30'),
(31, 'Ponagar Riverside Stay', 'H31'),
(32, 'Hòn Chồng Breeze House', 'H32'),
(33, 'Đầm Market City Home', 'H33'),
(34, 'Trần Phú Sea View Home', 'H34'),
(35, 'Cảnh Long Bay House', 'H35'),
(36, 'Dinh Cậu Sunset Home', 'H36'),
(37, 'Dương Đông Night Market Stay', 'H37'),
(38, 'Bãi Trường Sunset House', 'H38'),
(39, 'Grand World Lagoon Home', 'H39'),
(40, 'Ông Lang Tropical House', 'H40'),
(41, 'Tây Bắc Square Home', 'H41'),
(42, 'Tô Hiệu Heritage Stay', 'H42'),
(43, 'Tây Bắc University Loft', 'H43'),
(44, 'Sơn La Transit Home', 'H44'),
(45, 'Sơn La Valley House', 'H45'),
(46, 'Km0 Gateway Home', 'H46'),
(47, '26/3 Riverside Stay', 'H47'),
(48, 'Núi Cấm Panorama House', 'H48'),
(49, 'Phương Thiện Road Home', 'H49'),
(50, 'Thái Hà Mountain Stay', 'H50');

-- ------------------------------------------------------------
-- 1) KIỂM TRA: homestay nào trong danh sách 50 chưa tồn tại?
-- Nếu query này không trả dòng nào thì mapping đã đầy đủ.
-- ------------------------------------------------------------
SELECT
    m.demo_no,
    m.folder_name,
    m.home_name
FROM tmp_demo_homestay_image_map m
LEFT JOIN homestays h
       ON LOWER(TRIM(h.home_name)) = LOWER(TRIM(m.home_name))
      AND h.deleted_at IS NULL
WHERE h.home_id IS NULL
ORDER BY m.demo_no;

-- ------------------------------------------------------------
-- 2) XÓA ẢNH CŨ CỦA ĐÚNG 50 HOMESTAY DEMO.
-- Mục đích: sau khi chạy xong mỗi homestay có đúng 6 ảnh.
-- Không ảnh hưởng các homestay cũ ngoài danh sách 50 này.
-- ------------------------------------------------------------
DELETE hi
FROM homestay_images hi
JOIN homestays h
  ON h.home_id = hi.home_id
JOIN tmp_demo_homestay_image_map m
  ON LOWER(TRIM(m.home_name)) = LOWER(TRIM(h.home_name))
WHERE hi.image_id > 0
  AND h.deleted_at IS NULL;

-- ------------------------------------------------------------
-- 3) THÊM 6 ẢNH / HOMESTAY = 300 DÒNG.
-- chinh.jpg luôn là ảnh chính (is_main = 1, sort_order = 1).
-- ------------------------------------------------------------
INSERT INTO homestay_images (
    home_id,
    image_url,
    is_main,
    sort_order
)
SELECT
    h.home_id,
    CONCAT(
        '/images/homestay/',
        m.folder_name,
        '/',
        image_file.file_name
    ) AS image_url,
    image_file.is_main,
    image_file.sort_order
FROM tmp_demo_homestay_image_map m
JOIN homestays h
  ON LOWER(TRIM(h.home_name)) = LOWER(TRIM(m.home_name))
 AND h.deleted_at IS NULL
CROSS JOIN (
    SELECT 'chinh.jpg'      AS file_name, 1 AS is_main, 1 AS sort_order
    UNION ALL
    SELECT 'phongkhach.jpg', 0, 2
    UNION ALL
    SELECT 'phongngu.jpg',   0, 3
    UNION ALL
    SELECT 'phongtam.jpg',   0, 4
    UNION ALL
    SELECT 'bep.jpg',        0, 5
    UNION ALL
    SELECT 'sanvuon.jpg',    0, 6
) image_file;

COMMIT;

-- Khôi phục Safe Updates về đúng trạng thái trước khi chạy script.
SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

-- ============================================================
-- KIỂM TRA SAU KHI INSERT
-- ============================================================

-- Phải ra:
-- total_homestays = 50
-- total_images     = 300
-- total_main       = 50
SELECT
    COUNT(DISTINCT h.home_id) AS total_homestays,
    COUNT(hi.image_id) AS total_images,
    SUM(CASE WHEN hi.is_main = 1 THEN 1 ELSE 0 END) AS total_main
FROM homestays h
JOIN tmp_demo_homestay_image_map m
  ON LOWER(TRIM(m.home_name)) = LOWER(TRIM(h.home_name))
JOIN homestay_images hi
  ON hi.home_id = h.home_id;

-- Mỗi homestay phải có image_count = 6 và main_count = 1.
SELECT
    m.demo_no,
    m.folder_name,
    h.home_id,
    h.home_name,
    COUNT(hi.image_id) AS image_count,
    SUM(CASE WHEN hi.is_main = 1 THEN 1 ELSE 0 END) AS main_count,
    MAX(CASE WHEN hi.is_main = 1 THEN hi.image_url END) AS main_image
FROM tmp_demo_homestay_image_map m
JOIN homestays h
  ON LOWER(TRIM(h.home_name)) = LOWER(TRIM(m.home_name))
LEFT JOIN homestay_images hi
  ON hi.home_id = h.home_id
GROUP BY
    m.demo_no,
    m.folder_name,
    h.home_id,
    h.home_name
ORDER BY m.demo_no;

-- Xem toàn bộ đường dẫn ảnh đã tạo.
SELECT
    m.demo_no,
    m.folder_name,
    h.home_id,
    h.home_name,
    hi.image_url,
    hi.is_main,
    hi.sort_order
FROM tmp_demo_homestay_image_map m
JOIN homestays h
  ON LOWER(TRIM(h.home_name)) = LOWER(TRIM(m.home_name))
JOIN homestay_images hi
  ON hi.home_id = h.home_id
ORDER BY m.demo_no, hi.sort_order, hi.image_id;
