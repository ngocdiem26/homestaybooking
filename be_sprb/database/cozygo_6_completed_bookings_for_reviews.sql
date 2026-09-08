-- ============================================================
-- COZYGO - 6 BOOKING ĐÃ HOÀN THÀNH GẦN ĐÂY
-- Mục đích: test chức năng đánh giá sau khi lưu trú.
--
-- Yêu cầu:
--   1) user_id = 5  -> home_id = 13
--   2) user_id = 7  -> home_id = 14
--   3) user_id = 8  -> home_id = 13
--   4) user_id = 5  -> home_id = 14
--   5) user_id = 7  -> home_id = 15
--   6) user_id = 8  -> home_id = 16
--
-- Tất cả:
--   booking_status = COMPLETED
--   payment_method = PAY_AT_PROPERTY
--   payment_status = PAID
--   checkout_date nằm trong khoảng 02/08/2026 - 15/08/2026
--
-- Giá phòng được lấy TRỰC TIẾP từ homestays.price_per_night.
-- Dịch vụ được lấy từ homestay_services của chính homestay đó.
-- Nếu dịch vụ ưu tiên không tồn tại, script tự lấy dịch vụ APPROVED đầu tiên.
-- Nếu homestay không có dịch vụ thì booking vẫn được tạo, service_total = 0.
--
-- Script có thể chạy lại: dùng booking_code cố định + NOT EXISTS để tránh trùng.
-- ============================================================

USE lvtn;
SET NAMES utf8mb4;

START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS tmp_review_test_booking_specs;
DROP TEMPORARY TABLE IF EXISTS tmp_review_test_service_choice;
DROP TEMPORARY TABLE IF EXISTS tmp_review_test_booking_calc;

-- ============================================================
-- 1. KHAI BÁO 6 BOOKING MẪU
-- ============================================================

CREATE TEMPORARY TABLE tmp_review_test_booking_specs (
    booking_code VARCHAR(50) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    home_id INT NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    number_of_guest INT NOT NULL,
    booking_note VARCHAR(500),
    created_at DATETIME NOT NULL,
    completed_at DATETIME NOT NULL,
    preferred_service_id INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_review_test_booking_specs (
    booking_code,
    user_id,
    home_id,
    checkin_date,
    checkout_date,
    number_of_guest,
    booking_note,
    created_at,
    completed_at,
    preferred_service_id
)
VALUES
(
    'BK20260801091523A5D1',
    5,
    13,
    '2026-08-02',
    '2026-08-04',
    2,
    'Nhận phòng khoảng 15:00, vui lòng chuẩn bị phòng trước.',
    '2026-08-01 09:15:23',
    '2026-08-04 12:35:00',
    3
),
(
    'BK20260803192047B7C2',
    7,
    14,
    '2026-08-04',
    '2026-08-06',
    2,
    'Ưu tiên khu vực yên tĩnh, hạn chế tiếng ồn.',
    '2026-08-03 19:20:47',
    '2026-08-06 12:20:00',
    1
),
(
    'BK20260805084016C8E3',
    8,
    13,
    '2026-08-06',
    '2026-08-07',
    1,
    'Khách dự kiến nhận phòng sau 16:00.',
    '2026-08-05 08:40:16',
    '2026-08-07 12:10:00',
    2
),
(
    'BK20260807211038D5F4',
    5,
    14,
    '2026-08-08',
    '2026-08-10',
    2,
    'Cần hỗ trợ gửi hành lý trước giờ nhận phòng.',
    '2026-08-07 21:10:38',
    '2026-08-10 12:25:00',
    4
),
(
    'BK20260809103052E7A5',
    7,
    15,
    '2026-08-10',
    '2026-08-12',
    2,
    'Không có yêu cầu đặc biệt.',
    '2026-08-09 10:30:52',
    '2026-08-12 12:15:00',
    5
),
(
    'BK20260812142531F8B6',
    8,
    16,
    '2026-08-13',
    '2026-08-15',
    3,
    'Có trẻ nhỏ đi cùng, vui lòng hỗ trợ sắp xếp phòng thuận tiện.',
    '2026-08-12 14:25:31',
    '2026-08-15 12:30:00',
    6
);

-- ============================================================
-- 2. KIỂM TRA USER / HOMESTAY
-- Hai query dưới đây PHẢI trả 0 dòng.
-- ============================================================

SELECT
    s.booking_code,
    s.user_id AS missing_user_id
FROM tmp_review_test_booking_specs s
LEFT JOIN users u
       ON u.user_id = s.user_id
      AND u.deleted_at IS NULL
WHERE u.user_id IS NULL;

SELECT
    s.booking_code,
    s.home_id AS missing_home_id
FROM tmp_review_test_booking_specs s
LEFT JOIN homestays h
       ON h.home_id = s.home_id
      AND h.deleted_at IS NULL
WHERE h.home_id IS NULL;

-- ============================================================
-- 3. CHỌN DỊCH VỤ CHO TỪNG BOOKING
--
-- Ưu tiên preferred_service_id.
-- Nếu homestay không có service đó thì lấy service APPROVED đầu tiên.
-- ============================================================

CREATE TEMPORARY TABLE tmp_review_test_service_choice AS
SELECT
    s.booking_code,
    COALESCE(
        MAX(
            CASE
                WHEN hs.service_id = s.preferred_service_id
                 AND hs.status = 'APPROVED'
                THEN hs.homestay_service_id
            END
        ),
        MIN(
            CASE
                WHEN hs.status = 'APPROVED'
                THEN hs.homestay_service_id
            END
        )
    ) AS homestay_service_id
FROM tmp_review_test_booking_specs s
LEFT JOIN homestay_services hs
       ON hs.home_id = s.home_id
GROUP BY
    s.booking_code;

-- ============================================================
-- 4. TÍNH TOÁN GIÁ PHÒNG + GIÁ DỊCH VỤ
-- ============================================================

CREATE TEMPORARY TABLE tmp_review_test_booking_calc AS
SELECT
    s.booking_code,
    s.user_id,
    s.home_id,
    s.checkin_date,
    s.checkout_date,
    DATEDIFF(s.checkout_date, s.checkin_date) AS number_of_nights,
    s.number_of_guest,
    s.booking_note,
    s.created_at,
    s.completed_at,

    h.price_per_night AS unit_price,
    h.price_per_night * DATEDIFF(s.checkout_date, s.checkin_date) AS room_total,

    sc.homestay_service_id,
    hs.price AS service_unit_price,
    hs.pricing_unit,

    CASE
        WHEN sc.homestay_service_id IS NULL THEN 0
        WHEN UPPER(COALESCE(hs.pricing_unit, 'PER_USE')) = 'PER_DAY'
            THEN DATEDIFF(s.checkout_date, s.checkin_date)
        ELSE 1
    END AS service_quantity,

    CASE
        WHEN sc.homestay_service_id IS NULL THEN 0
        WHEN UPPER(COALESCE(hs.pricing_unit, 'PER_USE')) = 'PER_DAY'
            THEN hs.price * DATEDIFF(s.checkout_date, s.checkin_date)
        ELSE hs.price
    END AS service_total

FROM tmp_review_test_booking_specs s
JOIN homestays h
  ON h.home_id = s.home_id
 AND h.deleted_at IS NULL
LEFT JOIN tmp_review_test_service_choice sc
  ON sc.booking_code = s.booking_code
LEFT JOIN homestay_services hs
  ON hs.homestay_service_id = sc.homestay_service_id;

-- Xem trước số tiền trước khi insert.
SELECT
    c.booking_code,
    c.user_id,
    c.home_id,
    c.checkin_date,
    c.checkout_date,
    c.number_of_nights,
    c.unit_price,
    c.room_total,
    c.homestay_service_id,
    c.service_unit_price,
    c.pricing_unit,
    c.service_quantity,
    c.service_total,
    c.room_total + c.service_total AS expected_total
FROM tmp_review_test_booking_calc c
ORDER BY c.checkin_date;

-- ============================================================
-- 5. INSERT BOOKINGS
-- ============================================================

INSERT INTO bookings (
    user_id,
    home_id,
    booking_status,
    created_at,
    updated_at,
    booking_note,
    subtotal,
    discount_amount,
    total_price,
    booking_code,
    payment_method,
    payment_status,
    payment_expires_at
)
SELECT
    c.user_id,
    c.home_id,
    'COMPLETED',
    c.created_at,
    c.completed_at,
    c.booking_note,
    c.room_total + c.service_total,
    0.00,
    c.room_total + c.service_total,
    c.booking_code,
    'PAY_AT_PROPERTY',
    'PAID',
    NULL
FROM tmp_review_test_booking_calc c
WHERE NOT EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.booking_code = c.booking_code
);

-- ============================================================
-- 6. INSERT BOOKING_DETAILS
-- ============================================================

INSERT INTO booking_details (
    booking_id,
    promotion_id,
    checkin_date,
    checkout_date,
    number_of_nights,
    number_of_guest,
    unit_price,
    line_total
)
SELECT
    b.booking_id,
    NULL,
    c.checkin_date,
    c.checkout_date,
    c.number_of_nights,
    c.number_of_guest,
    c.unit_price,
    c.room_total
FROM tmp_review_test_booking_calc c
JOIN bookings b
  ON b.booking_code = c.booking_code
WHERE NOT EXISTS (
    SELECT 1
    FROM booking_details bd
    WHERE bd.booking_id = b.booking_id
);

-- ============================================================
-- 7. INSERT BOOKING_SERVICES
-- Chỉ insert khi homestay thực sự có dịch vụ.
-- ============================================================

INSERT INTO booking_services (
    booking_id,
    homestay_service_id,
    quantity,
    unit_price,
    total_price,
    created_at
)
SELECT
    b.booking_id,
    c.homestay_service_id,
    c.service_quantity,
    c.service_unit_price,
    c.service_total,
    c.created_at
FROM tmp_review_test_booking_calc c
JOIN bookings b
  ON b.booking_code = c.booking_code
WHERE c.homestay_service_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM booking_services bs
      WHERE bs.booking_id = b.booking_id
        AND bs.homestay_service_id = c.homestay_service_id
  );

COMMIT;

-- ============================================================
-- 8. KIỂM TRA KẾT QUẢ
-- ============================================================

-- Phải có đúng 6 booking COMPLETED + PAID + PAY_AT_PROPERTY.
SELECT
    b.booking_id,
    b.user_id,
    b.home_id,
    h.home_name,
    b.booking_status,
    b.booking_code,
    b.payment_method,
    b.payment_status,
    b.subtotal,
    b.discount_amount,
    b.total_price,
    b.created_at,
    b.updated_at
FROM bookings b
JOIN homestays h
  ON h.home_id = b.home_id
JOIN tmp_review_test_booking_specs s
  ON s.booking_code = b.booking_code
ORDER BY b.updated_at DESC;

-- Chi tiết ngày ở.
SELECT
    b.booking_id,
    b.booking_code,
    bd.checkin_date,
    bd.checkout_date,
    bd.number_of_nights,
    bd.number_of_guest,
    bd.unit_price,
    bd.line_total
FROM bookings b
JOIN tmp_review_test_booking_specs s
  ON s.booking_code = b.booking_code
JOIN booking_details bd
  ON bd.booking_id = b.booking_id
ORDER BY bd.checkout_date;

-- Dịch vụ của từng booking.
SELECT
    b.booking_id,
    b.booking_code,
    h.home_name,
    sv.service_name,
    hs.pricing_unit,
    bs.quantity,
    bs.unit_price,
    bs.total_price
FROM bookings b
JOIN tmp_review_test_booking_specs spec
  ON spec.booking_code = b.booking_code
JOIN homestays h
  ON h.home_id = b.home_id
LEFT JOIN booking_services bs
  ON bs.booking_id = b.booking_id
LEFT JOIN homestay_services hs
  ON hs.homestay_service_id = bs.homestay_service_id
LEFT JOIN services sv
  ON sv.service_id = hs.service_id
ORDER BY b.booking_id;

-- Query phục vụ kiểm tra điều kiện đánh giá.
-- Cả 6 đơn phải thỏa:
-- COMPLETED + PAID + checkout_date < 2026-08-16.
SELECT
    b.booking_id,
    b.user_id,
    b.home_id,
    b.booking_code,
    b.booking_status,
    b.payment_status,
    bd.checkout_date,
    CASE
        WHEN b.booking_status = 'COMPLETED'
         AND b.payment_status = 'PAID'
         AND bd.checkout_date < '2026-08-16'
        THEN 'ELIGIBLE_TO_REVIEW'
        ELSE 'NOT_ELIGIBLE'
    END AS review_eligibility
FROM bookings b
JOIN tmp_review_test_booking_specs s
  ON s.booking_code = b.booking_code
JOIN booking_details bd
  ON bd.booking_id = b.booking_id
ORDER BY bd.checkout_date;
