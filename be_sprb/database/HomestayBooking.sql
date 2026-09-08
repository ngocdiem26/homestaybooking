-- Homestay Booking Database
-- Fixed version: UTF-8, MySQL-compatible, clean foreign key names
-- Charset: utf8mb4
CREATE DATABASE IF NOT EXISTS lvtn
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE lvtn;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;



SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
    role_id INT NOT NULL AUTO_INCREMENT,
    role_name VARCHAR(30) NOT NULL,
    description_role TEXT,
    PRIMARY KEY (role_id),
    UNIQUE KEY uk_roles_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    address VARCHAR(255),
    birthday DATE,
    gender VARCHAR(10),
    user_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    avatar LONGTEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_users_email (email),
    KEY idx_users_role_id (role_id),
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homestays (
    home_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    home_name VARCHAR(255) NOT NULL,
    home_address VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    home_description TEXT,
    price_per_night DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    discount_percent DECIMAL(5,2) DEFAULT 0,
    max_guest INT NOT NULL,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    bedroom_count INT NOT NULL,
    bathroom_count INT NOT NULL,
    kitchen_count INT NOT NULL,
    living_room_count INT NOT NULL,
    bed_count INT NOT NULL,
    checkin_time TIME NOT NULL,
    checkout_time TIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (home_id),
    KEY idx_homestays_user_id (user_id),
    CONSTRAINT fk_homestays_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_homestays_discount_percent CHECK (discount_percent >= 0 AND discount_percent <= 100),
    CONSTRAINT ck_homestays_rating_avg CHECK (rating_avg >= 0 AND rating_avg <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE amenities (
    amenity_id INT NOT NULL AUTO_INCREMENT,
    amenity_name VARCHAR(100) NOT NULL,
    description_amenity TEXT,
    PRIMARY KEY (amenity_id),
    UNIQUE KEY uk_amenities_name (amenity_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE services (
    service_id INT NOT NULL AUTO_INCREMENT,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    PRIMARY KEY (service_id),
    UNIQUE KEY uk_services_name (service_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homestay_amenities (
    amenity_id INT NOT NULL,
    home_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (amenity_id, home_id),
    KEY idx_homestay_amenities_home_id (home_id),
    CONSTRAINT fk_homestay_amenities_amenity
        FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_homestay_amenities_homestay
        FOREIGN KEY (home_id) REFERENCES homestays(home_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homestay_services (
    homestay_service_id INT NOT NULL AUTO_INCREMENT,
    service_id INT NOT NULL,
    home_id INT NOT NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM(
        'PENDING',
        'APPROVED',
        'REJECTED',
        'BLOCKED'
    ) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (homestay_service_id),
    UNIQUE KEY uk_homestay_services_home_service (home_id, service_id),
    KEY idx_homestay_services_service_id (service_id),
    CONSTRAINT fk_homestay_services_service
        FOREIGN KEY (service_id) REFERENCES services(service_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_homestay_services_homestay
        FOREIGN KEY (home_id) REFERENCES homestays(home_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homestay_images (
    image_id INT NOT NULL AUTO_INCREMENT,
    home_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    PRIMARY KEY (image_id),
    KEY idx_homestay_images_home_id (home_id),
    CONSTRAINT fk_homestay_images_homestay
        FOREIGN KEY (home_id) REFERENCES homestays(home_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homestay_availabilities (
    homestay_availability_id INT NOT NULL AUTO_INCREMENT,
    home_id INT NOT NULL,
    available_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (homestay_availability_id),
    UNIQUE KEY uk_homestay_availabilities_home_date (home_id, available_date),
    CONSTRAINT fk_homestay_availabilities_homestay
        FOREIGN KEY (home_id) REFERENCES homestays(home_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rules (
    rule_id INT NOT NULL AUTO_INCREMENT,
    home_id INT NOT NULL,
    rule_content VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (rule_id),
    KEY idx_rules_home_id (home_id),
    CONSTRAINT fk_rules_homestay
        FOREIGN KEY (home_id) REFERENCES homestays(home_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE promotions (
    promotion_id INT NOT NULL AUTO_INCREMENT,
    promotion_name VARCHAR(100) NOT NULL,
    promotion_code VARCHAR(20) NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(12,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    promotion_description TEXT,
    max_discount DECIMAL(12,2),
    min_order_amount DECIMAL(12,2) DEFAULT 0,
    usage_limit_total INT,
    usage_limit_per_user INT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (promotion_id),
    UNIQUE KEY uk_promotions_code (promotion_code),
    CONSTRAINT ck_promotions_discount_type CHECK (discount_type IN ('PERCENT', 'AMOUNT'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bookings (
    booking_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    home_id INT NOT NULL,
    booking_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    booking_note VARCHAR(255),
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (booking_id),
    KEY idx_bookings_user_id (user_id),
    KEY idx_bookings_home_id (home_id),
    CONSTRAINT fk_bookings_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_bookings_homestay
        FOREIGN KEY (home_id) REFERENCES homestays(home_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE booking_details (
    booking_detail_id INT NOT NULL AUTO_INCREMENT,
    booking_id INT NOT NULL,
    promotion_id INT,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    number_of_nights INT NOT NULL,
    number_of_guest INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (booking_detail_id),
    UNIQUE KEY uk_booking_details_booking_id (booking_id),
    KEY idx_booking_details_promotion_id (promotion_id),
    CONSTRAINT fk_booking_details_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_booking_details_promotion
        FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_booking_details_dates CHECK (checkout_date > checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE booking_services (
    booking_service_id INT NOT NULL AUTO_INCREMENT,
    booking_id INT NOT NULL,
    homestay_service_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (booking_service_id),
    KEY idx_booking_services_booking_id (booking_id),
    KEY idx_booking_services_homestay_service_id (homestay_service_id),
    CONSTRAINT fk_booking_services_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_booking_services_homestay_service
        FOREIGN KEY (homestay_service_id) REFERENCES homestay_services(homestay_service_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_booking_services_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
    payment_id INT NOT NULL AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    gateway VARCHAR(50),
    currency VARCHAR(20) DEFAULT 'VND',
    transaction_code VARCHAR(50),
    paid_at TIMESTAMP NULL DEFAULT NULL,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    refund_amount DECIMAL(12,2) NULL,
    refund_status VARCHAR(50) NULL,
    refund_transaction_code VARCHAR(80) NULL,
    refund_note VARCHAR(500) NULL,
    refunded_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (payment_id),
    KEY idx_payments_booking_id (booking_id),
    CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE promotion_usages (
    promotion_usage_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    promotion_id INT NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (promotion_usage_id),
    KEY idx_promotion_usages_user_id (user_id),
    KEY idx_promotion_usages_booking_id (booking_id),
    KEY idx_promotion_usages_promotion_id (promotion_id),
    CONSTRAINT fk_promotion_usages_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_promotion_usages_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_promotion_usages_promotion
        FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviews (
    review_id INT NOT NULL AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    home_id INT NOT NULL,
    rating TINYINT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id),
    UNIQUE KEY uk_reviews_booking_id (booking_id),
    KEY idx_reviews_user_id (user_id),
    KEY idx_reviews_home_id (home_id),
    CONSTRAINT fk_reviews_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_reviews_homestay
        FOREIGN KEY (home_id) REFERENCES homestays(home_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE review_replies (
    reply_id INT NOT NULL AUTO_INCREMENT,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (reply_id),
    KEY idx_review_replies_review_id (review_id),
    KEY idx_review_replies_user_id (user_id),
    CONSTRAINT fk_review_replies_review
        FOREIGN KEY (review_id) REFERENCES reviews(review_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_review_replies_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE complaints (
    complaint_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    complaint_content TEXT NOT NULL,
    complaint_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    complaint_reply TEXT,
    PRIMARY KEY (complaint_id),
    KEY idx_complaints_user_id (user_id),
    KEY idx_complaints_booking_id (booking_id),
    CONSTRAINT fk_complaints_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_complaints_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favorites (
    favorite_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    home_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (favorite_id),
    UNIQUE KEY uk_favorites_user_home (user_id, home_id),
    KEY idx_favorites_home_id (home_id),
    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_favorites_homestay
        FOREIGN KEY (home_id) REFERENCES homestays(home_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE search_histories (
    search_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    search_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (search_id),
    KEY idx_search_histories_user_id (user_id),
    CONSTRAINT fk_search_histories_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_sessions (
    session_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (session_id),
    KEY idx_chat_sessions_user_id (user_id),
    CONSTRAINT fk_chat_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_messages (
    message_id INT NOT NULL AUTO_INCREMENT,
    session_id INT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id),
    KEY idx_chat_messages_session_id (session_id),
    CONSTRAINT fk_chat_messages_session
        FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_recommendations (
    recommendation_id INT NOT NULL AUTO_INCREMENT,
    message_id INT NOT NULL,
    home_id INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (recommendation_id),
    KEY idx_chat_recommendations_message_id (message_id),
    KEY idx_chat_recommendations_home_id (home_id),
    CONSTRAINT fk_chat_recommendations_message
        FOREIGN KEY (message_id) REFERENCES chat_messages(message_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_chat_recommendations_homestay
        FOREIGN KEY (home_id) REFERENCES homestays(home_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample roles
INSERT INTO roles (role_name, description_role) VALUES
('ADMIN', 'System administrator'),
('HOST', 'Homestay owner'),
('CUSTOMER', 'Customer who books homestays');



-- 1. Thêm vài tài khoản HOST mẫu
INSERT INTO users (
    role_id,
    full_name,
    email,
    password,
    phone_number,
    address,
    gender,
    user_status
)
VALUES
(2, 'Tran Minh Host', 'host1@gmail.com', '$2a$10$demo_password_hash', '0901111111', 'Đà Lạt, Lâm Đồng', 'Nam', 'ACTIVE'),
(2, 'Nguyen Thi Host', 'host2@gmail.com', '$2a$10$demo_password_hash', '0902222222', 'Cần Thơ', 'Nữ', 'ACTIVE'),
(2, 'Le Van Host', 'host3@gmail.com', '$2a$10$demo_password_hash', '0903333333', 'Đà Nẵng', 'Nam', 'ACTIVE');

-- 2. Thêm homestay mẫu
INSERT INTO homestays (
    user_id,
    home_name,
    home_address,
    province,
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
    checkout_time
)
VALUES
(
    2,
    'Bungalow Rừng Thông Đà Lạt',
    '123 Đường Đồi Thông, Phường 3, Đà Lạt',
    'Lâm Đồng',
    'Homestay nằm giữa rừng thông, không gian yên tĩnh, phù hợp nghỉ dưỡng cuối tuần.',
    850000,
    'PENDING',
    10.00,
    4,
    4.70,
    25,
    2,
    1,
    1,
    1,
    2,
    '14:00:00',
    '12:00:00'
),
(
    2,
    'Nhà Gỗ Ven Hồ Tuyền Lâm',
    '45 Khu du lịch Hồ Tuyền Lâm, Đà Lạt',
    'Lâm Đồng',
    'Nhà gỗ view hồ, có sân BBQ và khu vực chụp ảnh ngoài trời.',
    1200000,
    'PENDING',
    15.00,
    6,
    4.80,
    38,
    3,
    2,
    1,
    1,
    3,
    '14:00:00',
    '12:00:00'
),
(
    3,
    'Mekong Garden Homestay',
    '88 Đường ven sông, Ninh Kiều, Cần Thơ',
    'Cần Thơ',
    'Homestay phong cách miền Tây, có vườn cây và trải nghiệm chèo xuồng.',
    650000,
    'PENDING',
    5.00,
    5,
    4.50,
    19,
    2,
    1,
    1,
    1,
    2,
    '13:00:00',
    '11:00:00'
),
(
    3,
    'Cozy River House',
    '12 Bến Ninh Kiều, Cần Thơ',
    'Cần Thơ',
    'Căn nhà nhỏ ven sông, phù hợp cặp đôi hoặc gia đình nhỏ.',
    720000,
    'PENDING',
    0.00,
    3,
    4.30,
    12,
    1,
    1,
    1,
    1,
    1,
    '14:00:00',
    '12:00:00'
),
(
    4,
    'Sea Breeze Homestay Đà Nẵng',
    '25 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
    'Đà Nẵng',
    'Homestay gần biển, thiết kế hiện đại, đi bộ 5 phút ra bãi biển.',
    950000,
    'PENDING',
    12.00,
    4,
    4.60,
    31,
    2,
    2,
    1,
    1,
    2,
    '14:00:00',
    '12:00:00'
);

-- 3. Thêm ảnh cho homestay
INSERT INTO homestay_images (
    home_id,
    image_url,
    is_main,
    sort_order
)
VALUES
-- Homestay 1
(1, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', TRUE, 1),
(1, 'https://images.unsplash.com/photo-1449844908441-8829872d2607', FALSE, 2),
(1, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233', FALSE, 3),

-- Homestay 2
(2, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', TRUE, 1),
(2, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', FALSE, 2),
(2, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739', FALSE, 3),

-- Homestay 3
(3, 'https://images.unsplash.com/photo-1523217582562-09d0def993a6', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', FALSE, 2),
(3, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', FALSE, 3),

-- Homestay 4
(4, 'https://images.unsplash.com/photo-1494526585095-c41746248156', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae', FALSE, 2),

-- Homestay 5
(5, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', TRUE, 1),
(5, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', FALSE, 2);

ALTER TABLE homestays
ADD COLUMN latitude DECIMAL(10,7) NULL AFTER province,
ADD COLUMN longitude DECIMAL(10,7) NULL AFTER latitude;

CREATE TABLE activities (
    activity_id INT NOT NULL AUTO_INCREMENT,

    activity_name VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    activity_address VARCHAR(255),

    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    short_description VARCHAR(255),
    thumbnail_url VARCHAR(255),

    badge_text VARCHAR(100),
    badge_type VARCHAR(50),

    activity_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT DEFAULT 0,

    created_by INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (activity_id),

    CONSTRAINT fk_activities_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT,

    CONSTRAINT ck_activities_status
        CHECK (activity_status IN ('ACTIVE', 'HIDDEN', 'DELETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE destinations (
    destination_id INT NOT NULL AUTO_INCREMENT,

    province_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    slug VARCHAR(150) NOT NULL,

    description VARCHAR(255),
    thumbnail_url VARCHAR(255),

    display_order INT DEFAULT 0,
    destination_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (destination_id),
    UNIQUE KEY uk_destinations_slug (slug),

    CONSTRAINT ck_destinations_status
        CHECK (destination_status IN ('ACTIVE', 'HIDDEN', 'DELETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE promotions
ADD COLUMN theme ENUM('GREEN', 'PURPLE', 'ORANGE', 'BLUE', 'PINK', 'TEAL', 'DARK')
NOT NULL DEFAULT 'GREEN';

CREATE TABLE destination_itinerary_items (
    item_id INT NOT NULL AUTO_INCREMENT,

    destination_id INT NOT NULL,

    start_time TIME NULL,
    end_time TIME NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),

    display_order INT DEFAULT 0,
    item_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (item_id),

    KEY idx_itinerary_destination_id (destination_id),

    CONSTRAINT fk_itinerary_destination
        FOREIGN KEY (destination_id) REFERENCES destinations(destination_id)
        ON DELETE CASCADE ON UPDATE RESTRICT,

    CONSTRAINT ck_itinerary_status
        CHECK (item_status IN ('ACTIVE', 'HIDDEN', 'DELETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 ALTER TABLE bookings
ADD COLUMN booking_code VARCHAR(50) UNIQUE;

ALTER TABLE bookings
ADD COLUMN payment_method VARCHAR(50);

ALTER TABLE bookings
ADD COLUMN payment_status VARCHAR(30) DEFAULT 'UNPAID';

ALTER TABLE bookings
ADD COLUMN payment_expires_at DATETIME;

ALTER TABLE payments
ADD COLUMN expires_at DATETIME;

ALTER TABLE payments
ADD COLUMN refund_amount DECIMAL(12,2) NULL,
ADD COLUMN refund_status VARCHAR(50) NULL,
ADD COLUMN refund_transaction_code VARCHAR(80) NULL,
ADD COLUMN refund_note VARCHAR(500) NULL,
ADD COLUMN refunded_at TIMESTAMP NULL DEFAULT NULL;

-- 1. Bổ sung 2 cột còn thiếu vào bảng reviews
ALTER TABLE reviews 
ADD COLUMN review_status VARCHAR(20) NOT NULL DEFAULT 'VISIBLE',
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Xóa bỏ Unique Key cũ dựa trên duy nhất booking_id (nếu có)
ALTER TABLE reviews DROP INDEX uk_reviews_booking_id;

-- 3. Thêm Unique Key mới kết hợp (booking_id, user_id) theo đúng logic code Java
ALTER TABLE reviews ADD CONSTRAINT uk_reviews_booking_user UNIQUE (booking_id, user_id);

-- 4. Tạo các chỉ mục (Indexes) tối ưu tìm kiếm theo mã Java yêu cầu
CREATE INDEX idx_reviews_home_status ON reviews(home_id, review_status);

-- Lưu ý: Cột user_id trong bảng cũ của bạn đã có một index tên là `idx_reviews_user_id`.
-- Để đồng bộ hẳn với tên index `idx_reviews_user` trong code Java, ta đổi tên nó:
ALTER TABLE reviews RENAME INDEX idx_reviews_user_id TO idx_reviews_user;

USE lvtn;

ALTER TABLE chat_sessions
MODIFY COLUMN user_id INT NULL;

ALTER TABLE chat_sessions
ADD COLUMN session_title VARCHAR(255) NULL AFTER user_id,
ADD COLUMN session_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' AFTER session_title;

ALTER TABLE chat_messages
ADD COLUMN intent VARCHAR(100) NULL AFTER message_content,
ADD COLUMN metadata JSON NULL AFTER intent;

CREATE TABLE IF NOT EXISTS chatbot_documents (
    document_id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (document_id),

    CONSTRAINT ck_chatbot_documents_status
        CHECK (status IN ('ACTIVE', 'HIDDEN', 'DELETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO chatbot_documents (title, content, document_type)
VALUES
(
    'Hướng dẫn đặt phòng',
    'Để đặt homestay, khách chọn homestay, chọn ngày nhận phòng, ngày trả phòng, số khách, sau đó bấm Đặt phòng một bảng yêu cầu nhập thông tin đặt phòng sẽ xuất hiện, bạn chỉ cần điền thông tin theo yêu cầu và hoàn thành đầy đủ các bước.  Nếu chưa đăng nhập, hệ thống yêu cầu đăng nhập trước. Sau khi xác nhận thông tin, khách chọn thanh toán online qua VNPAY hoặc thanh toán tại chỗ.',
    'BOOKING_GUIDE'
),
(
    'Thanh toán VNPAY',
    'Thanh toán VNPAY là hình thức thanh toán online bằng cổng thanh toán VNPAY Sandbox. Sau khi khách thanh toán test thành công trên cổng VNPAY, hệ thống nhận webhook từ VNPAY và cập nhật booking thành đã xác nhận.',
    'PAYMENT_GUIDE'
),
(
    'Thanh toán tại chỗ',
    'Nếu chọn thanh toán tại chỗ, booking được tạo với trạng thái đã xác nhận, còn trạng thái thanh toán là chờ thanh toán. Khách sẽ thanh toán trực tiếp khi nhận phòng tại homestay.',
    'PAYMENT_GUIDE'
),
(
    'Quy trình khiếu nại',
    'Khách có thể gửi khiếu nại trong mục Đặt phòng của tôi , chọn vào đơn đặt phòng đã hoàn thành của bạn sẽ xuất hiện nút viết khiếu nại. Vấn đề thanh toán, hệ thống hoặc báo cáo homestay/chủ homestay sẽ do admin xử lý trực tiếp và trao đổi thông qua email',
    'COMPLAINT_GUIDE'
);


CREATE TABLE IF NOT EXISTS chatbot_document_chunks (
    chunk_id BIGINT NOT NULL AUTO_INCREMENT,
    document_id INT NOT NULL,

    chunk_index INT NOT NULL,
    chunk_content TEXT NOT NULL,

    embedding_json LONGTEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (chunk_id),

    KEY idx_chunks_document_id (document_id),

    CONSTRAINT fk_chunks_document
        FOREIGN KEY (document_id) REFERENCES chatbot_documents(document_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO chatbot_documents (title, content, document_type)
SELECT
    'Chính sách mã khuyến mãi',
    'Mã khuyến mãi chỉ được áp dụng nếu còn hiệu lực, chưa hết lượt sử dụng và đơn đặt phòng đạt giá trị tối thiểu. Mỗi booking chỉ nên áp dụng một mã khuyến mãi. Nếu mã giảm theo phần trăm thì số tiền giảm không vượt quá mức giảm tối đa.',
    'PROMOTION_GUIDE'
WHERE NOT EXISTS (
    SELECT 1 FROM chatbot_documents WHERE title = 'Chính sách mã khuyến mãi'
);

INSERT INTO chatbot_documents (title, content, document_type)
SELECT
    'Hướng dẫn tìm homestay',
    'Khách có thể tìm homestay theo tỉnh thành, địa điểm du lịch, số khách, ngân sách, tiện nghi và ngày lưu trú. Nếu không tìm thấy homestay phù hợp, khách có thể mở rộng khu vực, tăng ngân sách hoặc giảm số tiêu chí lọc.',
    'SEARCH_GUIDE'
WHERE NOT EXISTS (
    SELECT 1 FROM chatbot_documents WHERE title = 'Hướng dẫn tìm homestay'
);

INSERT INTO chatbot_documents (title, content, document_type)
SELECT
    'Hướng dẫn báo cáo homestay',
    'Nếu khách phát hiện homestay có thông tin sai sự thật, hình ảnh không đúng, chủ homestay thu tiền ngoài hệ thống, có dấu hiệu lừa đảo hoặc vấn đề an toàn, khách nên dùng chức năng báo cáo homestay để admin xử lý trực tiếp.',
    'REPORT_GUIDE'
WHERE NOT EXISTS (
    SELECT 1 FROM chatbot_documents WHERE title = 'Hướng dẫn báo cáo homestay'
);

INSERT INTO chatbot_documents (title, content, document_type)
SELECT
    'Hướng dẫn hủy đặt phòng',
    'Nếu khách muốn hủy đặt phòng, khách vào mục Đặt phòng của tôi, chọn đơn đặt phòng cần hủy và bấm hủy nếu đơn còn trong trạng thái cho phép hủy. Việc hoàn tiền nếu có sẽ phụ thuộc vào phương thức thanh toán và chính sách của hệ thống.',
    'CANCEL_GUIDE'
WHERE NOT EXISTS (
    SELECT 1 FROM chatbot_documents WHERE title = 'Hướng dẫn hủy đặt phòng'
);

drop table activities;

CREATE TABLE IF NOT EXISTS activities (
    activity_id INT NOT NULL AUTO_INCREMENT,

    activity_name VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    activity_address VARCHAR(255) NULL,

    short_description VARCHAR(255) NULL,
    description TEXT NOT NULL,

    hotline VARCHAR(30) NULL,
    thumbnail_url VARCHAR(255) NULL,

    badge_text VARCHAR(100) NULL,
    badge_type VARCHAR(50) NULL,

    activity_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,

    created_by INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (activity_id),

    KEY idx_activities_province (province),
    KEY idx_activities_status (activity_status),
    KEY idx_activities_featured (is_featured),

    CONSTRAINT fk_activities_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE SET NULL
        ON UPDATE RESTRICT,

    CONSTRAINT ck_activities_status
        CHECK (activity_status IN ('ACTIVE', 'HIDDEN', 'DELETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_images (
    image_id BIGINT NOT NULL AUTO_INCREMENT,
    activity_id INT NOT NULL,

    image_url VARCHAR(255) NOT NULL,

    is_thumbnail BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (image_id),

    KEY idx_activity_images_activity_id (activity_id),

    CONSTRAINT fk_activity_images_activity
        FOREIGN KEY (activity_id) REFERENCES activities(activity_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE destinations
ADD COLUMN city VARCHAR(100) NULL AFTER province_name;
ALTER TABLE homestays
ADD COLUMN city VARCHAR(100) NULL AFTER province;
ALTER TABLE homestays
ADD INDEX idx_homestays_province (province);
ALTER TABLE homestays
ADD INDEX idx_homestays_city (city);
UPDATE homestays
SET city = 'Đà Lạt',
    province = 'Lâm Đồng'
WHERE province = 'Đà Lạt';



INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/batca/cover.jpg', TRUE, 1
FROM activities WHERE activity_name = 'Bắt cá ruộng miền Tây';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/batca/img1.jpg', FALSE, 2
FROM activities WHERE activity_name = 'Bắt cá ruộng miền Tây';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/batca/img2.jpg', FALSE, 3
FROM activities WHERE activity_name = 'Bắt cá ruộng miền Tây';


INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/gatlua/cover.jpg', TRUE, 1
FROM activities WHERE activity_name = 'Gặt lúa cùng nông dân';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/gatlua/img1.jpg', FALSE, 2
FROM activities WHERE activity_name = 'Gặt lúa cùng nông dân';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/gatlua/img2.jpg', FALSE, 3
FROM activities WHERE activity_name = 'Gặt lúa cùng nông dân';


INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/cheoxuong/cover.jpg', TRUE, 1
FROM activities WHERE activity_name = 'Chèo xuồng ba lá trên rạch dừa nước';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/cheoxuong/img1.jpg', FALSE, 2
FROM activities WHERE activity_name = 'Chèo xuồng ba lá trên rạch dừa nước';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/cheoxuong/img2.jpg', FALSE, 3
FROM activities WHERE activity_name = 'Chèo xuồng ba lá trên rạch dừa nước';


INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/cheothuyenthung/cover.jpg', TRUE, 1
FROM activities WHERE activity_name = 'Chèo thuyền thúng ở Đà Nẵng';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/cheothuyenthung/img1.jpg', FALSE, 2
FROM activities WHERE activity_name = 'Chèo thuyền thúng ở Đà Nẵng';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/cheothuyenthung/img2.jpg', FALSE, 3
FROM activities WHERE activity_name = 'Chèo thuyền thúng ở Đà Nẵng';


INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/danlatthucong/cover.jpg', TRUE, 1
FROM activities WHERE activity_name = 'Đan lát thủ công cùng nghệ nhân';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/danlatthucong/img1.jpg', FALSE, 2
FROM activities WHERE activity_name = 'Đan lát thủ công cùng nghệ nhân';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/danlatthucong/img2.jpg', FALSE, 3
FROM activities WHERE activity_name = 'Đan lát thủ công cùng nghệ nhân';


INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/thuhoachrau/cover.jpg', TRUE, 1
FROM activities WHERE activity_name = 'Thu hoạch rau tại vườn';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/thuhoachrau/img1.jpg', FALSE, 2
FROM activities WHERE activity_name = 'Thu hoạch rau tại vườn';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/thuhoachrau/img2.jpg', FALSE, 3
FROM activities WHERE activity_name = 'Thu hoạch rau tại vườn';


INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/lamgom/cover.jpg', TRUE, 1
FROM activities WHERE activity_name = 'Trải nghiệm làm gốm';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/lamgom/img1.jpg', FALSE, 2
FROM activities WHERE activity_name = 'Trải nghiệm làm gốm';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/lamgom/img2.jpg', FALSE, 3
FROM activities WHERE activity_name = 'Trải nghiệm làm gốm';


INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/keoluoi/cover.jpg', TRUE, 1
FROM activities WHERE activity_name = 'Kéo lưới cùng ngư dân';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/keoluoi/img1.jpg', FALSE, 2
FROM activities WHERE activity_name = 'Kéo lưới cùng ngư dân';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/keoluoi/img2.jpg', FALSE, 3
FROM activities WHERE activity_name = 'Kéo lưới cùng ngư dân';


INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/lambanh/cover.jpg', TRUE, 1
FROM activities WHERE activity_name = 'Làm bánh dân gian Nam Bộ';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/lambanh/img1.jpg', FALSE, 2
FROM activities WHERE activity_name = 'Làm bánh dân gian Nam Bộ';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/lambanh/img2.jpg', FALSE, 3
FROM activities WHERE activity_name = 'Làm bánh dân gian Nam Bộ';


INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/naucomlam/cover.jpg', TRUE, 1
FROM activities WHERE activity_name = 'Nấu cơm lam và giao lưu bản địa';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/naucomlam/img1.jpg', FALSE, 2
FROM activities WHERE activity_name = 'Nấu cơm lam và giao lưu bản địa';

INSERT INTO activity_images (activity_id, image_url, is_thumbnail, display_order)
SELECT activity_id, '/images/activities/naucomlam/img2.jpg', FALSE, 3
FROM activities WHERE activity_name = 'Nấu cơm lam và giao lưu bản địa';

ALTER TABLE activities
ADD COLUMN latitude DECIMAL(10,7) NULL AFTER activity_address,
ADD COLUMN longitude DECIMAL(10,7) NULL AFTER latitude;

UPDATE activities
SET latitude = 10.0015000,
    longitude = 105.6688000
WHERE activity_id = 1;
-- Bắt cá ruộng miền Tây - Phong Điền, Cần Thơ


UPDATE activities
SET latitude = 10.3067000,
    longitude = 105.7689000
WHERE activity_id = 2;
-- Gặt lúa cùng nông dân - Tân Khánh Đông, Sa Đéc, Đồng Tháp


UPDATE activities
SET latitude = 10.2363000,
    longitude = 106.3744000
WHERE activity_id = 3;
-- Chèo xuồng ba lá trên rạch dừa nước - Cồn Phụng, Bến Tre


UPDATE activities
SET latitude = 15.8801000,
    longitude = 108.3632000
WHERE activity_id = 4;
-- Chèo thuyền thúng ở Đà Nẵng - Rừng dừa Bảy Mẫu, Hội An Đông


UPDATE activities
SET latitude = 15.8810000,
    longitude = 108.3606000
WHERE activity_id = 5;
-- Đan lát thủ công cùng nghệ nhân - Cẩm Thanh, Hội An


UPDATE activities
SET latitude = 11.9469000,
    longitude = 108.4984000
WHERE activity_id = 6;
-- Thu hoạch rau tại vườn - Làng rau Trại Mát, Đà Lạt


UPDATE activities
SET latitude = 20.1549000,
    longitude = 106.0073000
WHERE activity_id = 7;
-- Trải nghiệm làm gốm - Làng gốm Bồ Bát, Yên Mô, Ninh Bình


UPDATE activities
SET latitude = 20.8843000,
    longitude = 107.0965000
WHERE activity_id = 8;
-- Kéo lưới cùng ngư dân - Làng chài Cửa Vạn, vịnh Hạ Long


UPDATE activities
SET latitude = 9.9578000,
    longitude = 105.9586000
WHERE activity_id = 9;
-- Làm bánh dân gian Nam Bộ - Cồn Mỹ Phước, Kế Sách, Sóc Trăng


UPDATE activities
SET latitude = 22.3068000,
    longitude = 103.8893000
WHERE activity_id = 10;
-- Nấu cơm lam và giao lưu bản địa - Bản Tả Van, Sa Pa

UPDATE homestays
SET latitude = 11.9398000,
    longitude = 108.4339000
WHERE home_id = 6;
-- Bungalow Rừng Thông - Phường 3, Đà Lạt


UPDATE homestays
SET latitude = 11.9047000,
    longitude = 108.4334000
WHERE home_id = 7;
-- Nhà Gỗ Ven Hồ Tuyền Lâm - Hồ Tuyền Lâm, Đà Lạt


UPDATE homestays
SET latitude = 10.0312000,
    longitude = 105.7852000
WHERE home_id = 8;
-- Mekong Garden Homestay - ven sông, Ninh Kiều, Cần Thơ


UPDATE homestays
SET latitude = 10.0341000,
    longitude = 105.7867000
WHERE home_id = 9;
-- Cozy River House - Bến Ninh Kiều, Cần Thơ


UPDATE homestays
SET latitude = 16.0692000,
    longitude = 108.2467000
WHERE home_id = 10;
-- Sea Breeze Homestay Đà Nẵng - Võ Nguyên Giáp, Sơn Trà


UPDATE homestays
SET latitude = 10.0265000,
    longitude = 105.7732000
WHERE home_id = 11;
-- An Nhiên Homestay - Võ Thị Sáu, Xuân Khánh, Ninh Kiều


UPDATE homestays
SET latitude = 10.0269000,
    longitude = 105.7736000
WHERE home_id = 12;
-- An Nhiên Homestay - Võ Thị Sáu, Xuân Khánh, Ninh Kiều


ALTER TABLE promotions
ADD COLUMN promotion_scope VARCHAR(30) NOT NULL DEFAULT 'GLOBAL'
AFTER promotion_code;
ALTER TABLE promotions
ADD CONSTRAINT ck_promotions_scope
CHECK (promotion_scope IN ('GLOBAL', 'HOMESTAY', 'USER', 'HOMESTAY_USER'));

CREATE TABLE IF NOT EXISTS promotion_homestays (
    promotion_id INT NOT NULL,
    home_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (promotion_id, home_id),

    CONSTRAINT fk_promotion_homestays_promotion
        FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,

    CONSTRAINT fk_promotion_homestays_homestay
        FOREIGN KEY (home_id) REFERENCES homestays(home_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS promotion_users (
    promotion_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (promotion_id, user_id),

    CONSTRAINT fk_promotion_users_promotion
        FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,

    CONSTRAINT fk_promotion_users_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE promotion_usages
ADD UNIQUE KEY uk_promotion_usages_promotion_booking (promotion_id, booking_id);

CREATE TABLE IF NOT EXISTS loyalty_tiers (
    tier_id INT NOT NULL AUTO_INCREMENT,
    tier_code VARCHAR(30) NOT NULL,
    tier_name VARCHAR(50) NOT NULL,

    min_completed_bookings_24m INT NOT NULL DEFAULT 0,

    display_order INT NOT NULL DEFAULT 0,
    tier_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (tier_id),
    UNIQUE KEY uk_loyalty_tiers_code (tier_code),

    CONSTRAINT ck_loyalty_tiers_status
        CHECK (tier_status IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO loyalty_tiers (
    tier_code,
    tier_name,
    min_completed_bookings_24m,
    display_order,
    tier_status
)
VALUES
('BRONZE', 'Đồng', 0, 1, 'ACTIVE'),
('SILVER', 'Bạc', 5, 2, 'ACTIVE'),
('GOLD', 'Vàng', 15, 3, 'ACTIVE'),
('DIAMOND', 'Kim cương', 30, 4, 'ACTIVE');

UPDATE loyalty_tiers
SET tier_name = 'Đồng',
    min_completed_bookings_24m = 0,
    display_order = 1,
    tier_status = 'ACTIVE'
WHERE tier_code = 'BRONZE';

UPDATE loyalty_tiers
SET tier_name = 'Bạc',
    min_completed_bookings_24m = 5,
    display_order = 2,
    tier_status = 'ACTIVE'
WHERE tier_code = 'SILVER';

UPDATE loyalty_tiers
SET tier_name = 'Vàng',
    min_completed_bookings_24m = 15,
    display_order = 3,
    tier_status = 'ACTIVE'
WHERE tier_code = 'GOLD';

UPDATE loyalty_tiers
SET tier_name = 'Kim cương',
    min_completed_bookings_24m = 30,
    display_order = 4,
    tier_status = 'ACTIVE'
WHERE tier_code = 'DIAMOND';

CREATE TABLE IF NOT EXISTS customer_tier_accounts (
    user_id INT NOT NULL,

    current_tier_id INT NOT NULL,
    completed_bookings_24m INT NOT NULL DEFAULT 0,

    tier_started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_calculated_at TIMESTAMP NULL DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),

    CONSTRAINT fk_customer_tier_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT fk_customer_tier_tier
        FOREIGN KEY (current_tier_id) REFERENCES loyalty_tiers(tier_id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO customer_tier_accounts (
    user_id,
    current_tier_id,
    completed_bookings_24m
)
SELECT 
    u.user_id,
    lt.tier_id,
    0
FROM users u
JOIN roles r ON r.role_id = u.role_id
JOIN loyalty_tiers lt ON lt.tier_code = 'BRONZE'
WHERE UPPER(r.role_name) = 'CUSTOMER'
  AND u.deleted_at IS NULL;
 
CREATE TABLE IF NOT EXISTS promotion_tiers (
    promotion_id INT NOT NULL,
    tier_id INT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (promotion_id, tier_id),

    CONSTRAINT fk_promotion_tiers_promotion
        FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,

    CONSTRAINT fk_promotion_tiers_tier
        FOREIGN KEY (tier_id) REFERENCES loyalty_tiers(tier_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
   
ALTER TABLE promotions
DROP CHECK ck_promotions_scope;

ALTER TABLE promotions
ADD CONSTRAINT ck_promotions_scope
CHECK (
    promotion_scope IN (
        'GLOBAL',
        'HOMESTAY',
        'USER',
        'TIER',
        'HOMESTAY_USER',
        'HOMESTAY_TIER'
    )
);

INSERT INTO promotions (
    promotion_name,
    promotion_code,
    promotion_scope,
    discount_type,
    discount_value,
    start_date,
    end_date,
    max_discount,
    min_order_amount,
    usage_limit_total,
    usage_limit_per_user,
    status
)
SELECT
    'Ưu đãi khách hạng Bạc',
    'SILVER2026',
    'TIER',
    'PERCENT',
    5.00,
    '2026-01-01',
    '2026-12-31',
    100000.00,
    500000.00,
    NULL,
    2,
    'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM promotions WHERE promotion_code = 'SILVER2026'
);

INSERT IGNORE INTO promotion_tiers (promotion_id, tier_id)
SELECT p.promotion_id, lt.tier_id
FROM promotions p
JOIN loyalty_tiers lt ON lt.tier_code = 'SILVER'
WHERE p.promotion_code = 'SILVER2026';

INSERT INTO promotions (
    promotion_name,
    promotion_code,
    promotion_scope,
    discount_type,
    discount_value,
    start_date,
    end_date,
    max_discount,
    min_order_amount,
    usage_limit_total,
    usage_limit_per_user,
    status
)
SELECT
    'Ưu đãi khách hạng Vàng',
    'GOLD2026',
    'TIER',
    'PERCENT',
    10.00,
    '2026-01-01',
    '2026-12-31',
    200000.00,
    500000.00,
    NULL,
    2,
    'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM promotions WHERE promotion_code = 'GOLD2026'
);

INSERT IGNORE INTO promotion_tiers (promotion_id, tier_id)
SELECT p.promotion_id, lt.tier_id
FROM promotions p
JOIN loyalty_tiers lt ON lt.tier_code = 'GOLD'
WHERE p.promotion_code = 'GOLD2026';

INSERT INTO promotions (
    promotion_name,
    promotion_code,
    promotion_scope,
    discount_type,
    discount_value,
    start_date,
    end_date,
    max_discount,
    min_order_amount,
    usage_limit_total,
    usage_limit_per_user,
    status
)
SELECT
    'Ưu đãi khách Kim cương',
    'DIAMOND2026',
    'TIER',
    'PERCENT',
    15.00,
    '2026-01-01',
    '2026-12-31',
    300000.00,
    500000.00,
    NULL,
    2,
    'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM promotions WHERE promotion_code = 'DIAMOND2026'
);

INSERT IGNORE INTO promotion_tiers (promotion_id, tier_id)
SELECT p.promotion_id, lt.tier_id
FROM promotions p
JOIN loyalty_tiers lt ON lt.tier_code = 'DIAMOND'
WHERE p.promotion_code = 'DIAMOND2026';

UPDATE customer_tier_accounts cta
LEFT JOIN (
    SELECT 
        b.user_id,
        COUNT(DISTINCT b.booking_id) AS completed_count
    FROM bookings b
    JOIN users u ON u.user_id = b.user_id
    JOIN booking_details bd ON bd.booking_id = b.booking_id
    WHERE COALESCE(b.created_at, CURRENT_TIMESTAMP) >= COALESCE(u.created_at, '1970-01-01 00:00:00')
      AND UPPER(COALESCE(b.booking_status, '')) NOT IN ('CANCELLED','CANCELED','EXPIRED','NO_SHOW','REJECTED','DELETED')
      AND (
          UPPER(COALESCE(b.booking_status, '')) IN ('COMPLETED','DONE','FINISHED')
          OR (
              (
                  UPPER(COALESCE(b.payment_status, '')) IN ('PAID','SUCCESS','COMPLETED','DA_THANH_TOAN')
                  OR EXISTS (
                      SELECT 1
                      FROM payments p
                      WHERE p.booking_id = b.booking_id
                        AND UPPER(COALESCE(p.payment_status, '')) IN ('PAID','SUCCESS','COMPLETED','DA_THANH_TOAN')
                  )
              )
              AND bd.checkin_date IS NOT NULL
              AND bd.checkin_date < CURRENT_DATE
          )
      )
    GROUP BY b.user_id
) completed ON completed.user_id = cta.user_id
SET 
    cta.completed_bookings_24m = COALESCE(completed.completed_count, 0),

    cta.tier_started_at = IF(
        cta.current_tier_id <> (
            SELECT lt.tier_id
            FROM loyalty_tiers lt
            WHERE lt.tier_status = 'ACTIVE'
              AND lt.min_completed_bookings_24m <= COALESCE(completed.completed_count, 0)
            ORDER BY lt.min_completed_bookings_24m DESC
            LIMIT 1
        ),
        CURRENT_TIMESTAMP,
        cta.tier_started_at
    ),

    cta.current_tier_id = (
        SELECT lt.tier_id
        FROM loyalty_tiers lt
        WHERE lt.tier_status = 'ACTIVE'
          AND lt.min_completed_bookings_24m <= COALESCE(completed.completed_count, 0)
        ORDER BY lt.min_completed_bookings_24m DESC
        LIMIT 1
    ),

    cta.last_calculated_at = CURRENT_TIMESTAMP,
    cta.updated_at = CURRENT_TIMESTAMP;

SET SQL_SAFE_UPDATES = 0;

UPDATE customer_tier_accounts cta
LEFT JOIN (
    SELECT 
        b.user_id,
        COUNT(DISTINCT b.booking_id) AS completed_count
    FROM bookings b
    JOIN users u ON u.user_id = b.user_id
    JOIN booking_details bd ON bd.booking_id = b.booking_id
    WHERE COALESCE(b.created_at, CURRENT_TIMESTAMP) >= COALESCE(u.created_at, '1970-01-01 00:00:00')
      AND UPPER(COALESCE(b.booking_status, '')) NOT IN ('CANCELLED','CANCELED','EXPIRED','NO_SHOW','REJECTED','DELETED')
      AND (
          UPPER(COALESCE(b.booking_status, '')) IN ('COMPLETED','DONE','FINISHED')
          OR (
              (
                  UPPER(COALESCE(b.payment_status, '')) IN ('PAID','SUCCESS','COMPLETED','DA_THANH_TOAN')
                  OR EXISTS (
                      SELECT 1
                      FROM payments p
                      WHERE p.booking_id = b.booking_id
                        AND UPPER(COALESCE(p.payment_status, '')) IN ('PAID','SUCCESS','COMPLETED','DA_THANH_TOAN')
                  )
              )
              AND bd.checkin_date IS NOT NULL
              AND bd.checkin_date < CURRENT_DATE
          )
      )
    GROUP BY b.user_id
) completed ON completed.user_id = cta.user_id
SET 
    cta.completed_bookings_24m = COALESCE(completed.completed_count, 0),

    cta.current_tier_id = (
        SELECT lt.tier_id
        FROM loyalty_tiers lt
        WHERE lt.tier_status = 'ACTIVE'
          AND lt.min_completed_bookings_24m <= COALESCE(completed.completed_count, 0)
        ORDER BY lt.min_completed_bookings_24m DESC
        LIMIT 1
    ),

    cta.last_calculated_at = CURRENT_TIMESTAMP,
    cta.updated_at = CURRENT_TIMESTAMP;

SET SQL_SAFE_UPDATES = 1;

INSERT INTO promotions (
    promotion_name,
    promotion_code,
    promotion_scope,
    discount_type,
    discount_value,
    start_date,
    end_date,
    max_discount,
    min_order_amount,
    usage_limit_total,
    usage_limit_per_user,
    status
)
SELECT
    'Ưu đãi khách hạng Đồng',
    'BRONZE2026',
    'TIER',
    'PERCENT',
    10.00,
    '2026-01-01',
    '2026-12-31',
    100000.00,
    300000.00,
    NULL,
    2,
    'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1
    FROM promotions
    WHERE promotion_code = 'BRONZE2026'
);
INSERT IGNORE INTO promotion_tiers (promotion_id, tier_id)
SELECT p.promotion_id, lt.tier_id
FROM promotions p
JOIN loyalty_tiers lt ON lt.tier_code = 'BRONZE'
WHERE p.promotion_code = 'BRONZE2026';

UPDATE `lvtn`.`promotions` SET `discount_value` = '20.00' WHERE (`promotion_id` = '4');
UPDATE `lvtn`.`promotions` SET `discount_value` = '30.00' WHERE (`promotion_id` = '5');
UPDATE `lvtn`.`promotions` SET `discount_value` = '40.00' WHERE (`promotion_id` = '6');

-- ALTER TABLE users MODIFY avatar LONGTEXT;

-- ALTER TABLE reviews
-- ADD COLUMN moderation_status VARCHAR(30) NULL,
-- ADD COLUMN moderation_action VARCHAR(30) NULL,
-- ADD COLUMN moderation_reason TEXT NULL,

-- ADD COLUMN toxicity_score DECIMAL(5,4) NULL,
-- ADD COLUMN profanity_score DECIMAL(5,4) NULL,
-- ADD COLUMN insult_score DECIMAL(5,4) NULL,
-- ADD COLUMN threat_score DECIMAL(5,4) NULL,
-- ADD COLUMN hate_score DECIMAL(5,4) NULL,
-- ADD COLUMN death_related_score DECIMAL(5,4) NULL,
-- ADD COLUMN spam_score DECIMAL(5,4) NULL,
-- ADD COLUMN privacy_score DECIMAL(5,4) NULL,

-- ADD COLUMN sentiment VARCHAR(30) NULL,
-- ADD COLUMN rating_comment_mismatch BOOLEAN NOT NULL DEFAULT FALSE,
-- ADD COLUMN moderation_categories JSON NULL,
-- ADD COLUMN moderated_at TIMESTAMP NULL;

-- ALTER TABLE reviews
-- ADD COLUMN admin_review_status VARCHAR(30) NOT NULL DEFAULT 'NONE'
-- AFTER review_status,
-- ADD COLUMN moderated_by INT NULL AFTER moderated_at,
-- ADD COLUMN hidden_reason TEXT NULL AFTER moderated_by;

-- CREATE TABLE IF NOT EXISTS review_moderation_logs (
--     log_id BIGINT NOT NULL AUTO_INCREMENT,
--     review_id INT NOT NULL,

--     provider VARCHAR(50) NOT NULL,
--     model_name VARCHAR(100) NULL,

--     moderation_action VARCHAR(30) NOT NULL,
--     admin_review_status VARCHAR(30) NULL,
--     moderation_reason TEXT NULL,

--     toxicity_score DECIMAL(5,4) NULL,
--     profanity_score DECIMAL(5,4) NULL,
--     insult_score DECIMAL(5,4) NULL,
--     threat_score DECIMAL(5,4) NULL,
--     hate_score DECIMAL(5,4) NULL,
--     death_related_score DECIMAL(5,4) NULL,
--     spam_score DECIMAL(5,4) NULL,
--     privacy_score DECIMAL(5,4) NULL,
--     final_score DECIMAL(5,4) NULL,

--     sentiment VARCHAR(30) NULL,
--     rating_comment_mismatch BOOLEAN NOT NULL DEFAULT FALSE,
--     raw_response LONGTEXT NULL,

--     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     PRIMARY KEY (log_id),

--     KEY idx_review_moderation_logs_review_id (review_id),

--     CONSTRAINT fk_review_moderation_logs_review
--         FOREIGN KEY (review_id) REFERENCES reviews(review_id)
--         ON DELETE CASCADE
-- );

-- ALTER TABLE reviews
--   MODIFY moderation_reason TEXT NULL,
--   MODIFY hidden_reason TEXT NULL;

-- ALTER TABLE review_moderation_logs
--   MODIFY moderation_reason TEXT NULL,
--   MODIFY raw_response LONGTEXT NULL;

-- ALTER TABLE review_moderation_logs
--   MODIFY moderation_reason TEXT NULL,
--   MODIFY raw_response LONGTEXT NULL;
  
-- ALTER TABLE review_moderation_logs

-- CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ALTER TABLE reviews

-- CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE activities
ADD COLUMN opening_time TIME NULL,
ADD COLUMN closing_time TIME NULL,
ADD COLUMN recommended_duration_minutes INT NULL,
ADD COLUMN best_time_of_day VARCHAR(30) NULL,
ADD COLUMN activity_intensity VARCHAR(30) NULL,
ADD COLUMN estimated_cost_min DECIMAL(12,2) NULL,
ADD COLUMN estimated_cost_max DECIMAL(12,2) NULL,
ADD COLUMN activity_tags JSON NULL,
ADD COLUMN suitable_group_types JSON NULL,
ADD COLUMN suitable_travel_styles JSON NULL;


SET SQL_SAFE_UPDATES = 0;

UPDATE activities
SET 
    opening_time = '07:00:00',
    closing_time = '17:00:00',
    recommended_duration_minutes = 180,
    best_time_of_day = 'MORNING',
    activity_intensity = 'MEDIUM',
    estimated_cost_min = 150000,
    estimated_cost_max = 300000,
    activity_tags = JSON_ARRAY('rural_experience', 'nature', 'local_life', 'farming', 'food'),
    suitable_group_types = JSON_ARRAY('FAMILY', 'FRIENDS', 'COUPLE'),
    suitable_travel_styles = JSON_ARRAY('DISCOVERY', 'NATURE', 'FAMILY')
WHERE activity_id = 1;

UPDATE activities
SET 
    opening_time = '06:00:00',
    closing_time = '16:00:00',
    recommended_duration_minutes = 180,
    best_time_of_day = 'MORNING',
    activity_intensity = 'MEDIUM',
    estimated_cost_min = 100000,
    estimated_cost_max = 250000,
    activity_tags = JSON_ARRAY('farming', 'local_experience', 'culture', 'nature', 'photo_spot'),
    suitable_group_types = JSON_ARRAY('FAMILY', 'FRIENDS', 'COUPLE'),
    suitable_travel_styles = JSON_ARRAY('DISCOVERY', 'NATURE', 'LOCAL_EXPERIENCE')
WHERE activity_id = 2;

UPDATE activities
SET 
    opening_time = '07:00:00',
    closing_time = '17:00:00',
    recommended_duration_minutes = 120,
    best_time_of_day = 'MORNING',
    activity_intensity = 'LIGHT',
    estimated_cost_min = 120000,
    estimated_cost_max = 250000,
    activity_tags = JSON_ARRAY('river', 'boating', 'local_experience', 'nature', 'relaxing'),
    suitable_group_types = JSON_ARRAY('FAMILY', 'COUPLE', 'FRIENDS'),
    suitable_travel_styles = JSON_ARRAY('RELAXING', 'DISCOVERY', 'NATURE')
WHERE activity_id = 3;

UPDATE activities
SET 
    opening_time = '08:00:00',
    closing_time = '17:00:00',
    recommended_duration_minutes = 90,
    best_time_of_day = 'AFTERNOON',
    activity_intensity = 'MEDIUM',
    estimated_cost_min = 100000,
    estimated_cost_max = 250000,
    activity_tags = JSON_ARRAY('boating', 'water_activity', 'local_experience', 'photo_spot', 'adventure'),
    suitable_group_types = JSON_ARRAY('FAMILY', 'FRIENDS', 'COUPLE'),
    suitable_travel_styles = JSON_ARRAY('DISCOVERY', 'ADVENTURE', 'LOCAL_EXPERIENCE')
WHERE activity_id = 4;

UPDATE activities
SET 
    opening_time = '08:00:00',
    closing_time = '17:00:00',
    recommended_duration_minutes = 90,
    best_time_of_day = 'AFTERNOON',
    activity_intensity = 'LIGHT',
    estimated_cost_min = 80000,
    estimated_cost_max = 200000,
    activity_tags = JSON_ARRAY('handicraft', 'culture', 'local_experience', 'workshop', 'family'),
    suitable_group_types = JSON_ARRAY('FAMILY', 'COUPLE', 'FRIENDS'),
    suitable_travel_styles = JSON_ARRAY('RELAXING', 'CULTURE', 'LOCAL_EXPERIENCE')
WHERE activity_id = 5;

UPDATE activities
SET 
    opening_time = '07:00:00',
    closing_time = '16:00:00',
    recommended_duration_minutes = 120,
    best_time_of_day = 'MORNING',
    activity_intensity = 'LIGHT',
    estimated_cost_min = 100000,
    estimated_cost_max = 250000,
    activity_tags = JSON_ARRAY('farm', 'vegetable_garden', 'nature', 'local_experience', 'family'),
    suitable_group_types = JSON_ARRAY('FAMILY', 'COUPLE', 'FRIENDS'),
    suitable_travel_styles = JSON_ARRAY('RELAXING', 'NATURE', 'LOCAL_EXPERIENCE')
WHERE activity_id = 6;

UPDATE activities
SET 
    opening_time = '08:00:00',
    closing_time = '17:00:00',
    recommended_duration_minutes = 120,
    best_time_of_day = 'AFTERNOON',
    activity_intensity = 'LIGHT',
    estimated_cost_min = 100000,
    estimated_cost_max = 250000,
    activity_tags = JSON_ARRAY('pottery', 'handicraft', 'culture', 'workshop', 'local_experience'),
    suitable_group_types = JSON_ARRAY('FAMILY', 'COUPLE', 'FRIENDS'),
    suitable_travel_styles = JSON_ARRAY('RELAXING', 'CULTURE', 'LOCAL_EXPERIENCE')
WHERE activity_id = 7;

UPDATE activities
SET 
    opening_time = '05:30:00',
    closing_time = '10:00:00',
    recommended_duration_minutes = 120,
    best_time_of_day = 'MORNING',
    activity_intensity = 'MEDIUM',
    estimated_cost_min = 150000,
    estimated_cost_max = 350000,
    activity_tags = JSON_ARRAY('fishing', 'sea', 'local_experience', 'adventure', 'nature'),
    suitable_group_types = JSON_ARRAY('FRIENDS', 'COUPLE', 'FAMILY'),
    suitable_travel_styles = JSON_ARRAY('DISCOVERY', 'ADVENTURE', 'LOCAL_EXPERIENCE')
WHERE activity_id = 8;

UPDATE activities
SET 
    opening_time = '08:00:00',
    closing_time = '17:00:00',
    recommended_duration_minutes = 120,
    best_time_of_day = 'AFTERNOON',
    activity_intensity = 'LIGHT',
    estimated_cost_min = 80000,
    estimated_cost_max = 200000,
    activity_tags = JSON_ARRAY('cuisine', 'local_food', 'culture', 'workshop', 'family'),
    suitable_group_types = JSON_ARRAY('FAMILY', 'COUPLE', 'FRIENDS'),
    suitable_travel_styles = JSON_ARRAY('RELAXING', 'CULTURE', 'LOCAL_EXPERIENCE')
WHERE activity_id = 9;

UPDATE activities
SET 
    opening_time = '16:00:00',
    closing_time = '20:30:00',
    recommended_duration_minutes = 150,
    best_time_of_day = 'EVENING',
    activity_intensity = 'LIGHT',
    estimated_cost_min = 150000,
    estimated_cost_max = 350000,
    activity_tags = JSON_ARRAY('cuisine', 'ethnic_culture', 'local_experience', 'mountain', 'community'),
    suitable_group_types = JSON_ARRAY('FAMILY', 'COUPLE', 'FRIENDS'),
    suitable_travel_styles = JSON_ARRAY('RELAXING', 'CULTURE', 'LOCAL_EXPERIENCE')
WHERE activity_id = 10;

SET SQL_SAFE_UPDATES = 1;

ALTER TABLE activities ADD COLUMN city VARCHAR(100) NULL AFTER province;

UPDATE activities SET city='Cần Thơ', province='Cần Thơ' WHERE activity_id=1;
UPDATE activities SET city='Sa Đéc', province='Đồng Tháp' WHERE activity_id=2;
UPDATE activities SET city='Bến Tre', province='Bến Tre' WHERE activity_id=3;
UPDATE activities SET city='Hội An', province='Quảng Nam' WHERE activity_id=4;
UPDATE activities SET city='Hội An', province='Quảng Nam' WHERE activity_id=5;
UPDATE activities SET city='Đà Lạt', province='Lâm Đồng' WHERE activity_id=6;
UPDATE activities SET city='Yên Mô', province='Ninh Bình' WHERE activity_id=7;
UPDATE activities SET city='Hạ Long', province='Quảng Ninh' WHERE activity_id=8;
UPDATE activities SET city='Kế Sách', province='Sóc Trăng' WHERE activity_id=9;
UPDATE activities SET city='Sa Pa', province='Lào Cai' WHERE activity_id=10;


DROP TABLE IF EXISTS itinerary_items;
DROP TABLE IF EXISTS itineraries;
DROP TABLE IF EXISTS user_itineraries;

CREATE TABLE itineraries (
    itinerary_id BIGINT NOT NULL AUTO_INCREMENT,
    itinerary_code VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,

    itinerary_title VARCHAR(255) NOT NULL,
    destination_keyword VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    province VARCHAR(100) NULL,

    start_date DATE NULL,
    end_date DATE NULL,
    total_days INT NOT NULL DEFAULT 1,
    traveler_count INT NULL,

    travel_style VARCHAR(50) NULL,
    pace VARCHAR(30) NULL,
    interests JSON NULL,

    selected_home_id INT NULL,

    itinerary_summary TEXT NULL,

    ai_provider VARCHAR(30) NULL DEFAULT 'GEMINI',
    ai_model VARCHAR(100) NULL DEFAULT 'gemini-2.5-flash',

    raw_user_request LONGTEXT NULL,
    raw_ai_response LONGTEXT NULL,

    generation_status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    generation_error TEXT NULL,

    itinerary_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (itinerary_id),

    UNIQUE KEY uk_itineraries_code (itinerary_code),

    KEY idx_itineraries_user (user_id),
    KEY idx_itineraries_user_status (
        user_id,
        itinerary_status,
        created_at
    ),
    KEY idx_itineraries_destination (
        province,
        city
    ),

    CONSTRAINT fk_itineraries_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,

    CONSTRAINT fk_itineraries_selected_home
        FOREIGN KEY (selected_home_id)
        REFERENCES homestays(home_id)
        ON DELETE SET NULL
        ON UPDATE RESTRICT
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE itinerary_items (
    item_id BIGINT NOT NULL AUTO_INCREMENT,
    itinerary_id BIGINT NOT NULL,

    day_number INT NOT NULL,

    start_time TIME NULL,
    end_time TIME NULL,
    duration_minutes INT NULL,

    preferred_time_of_day VARCHAR(30) NULL DEFAULT 'ANY',
    fixed_time BOOLEAN NOT NULL DEFAULT FALSE,

    title VARCHAR(255) NOT NULL,
    address VARCHAR(500) NULL,

    item_type VARCHAR(30) NOT NULL,
    source_type VARCHAR(30) NOT NULL,

    activity_id INT NULL,
    homestay_id INT NULL,

    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,

    estimated_cost DECIMAL(12,2) NULL,
    transport_note VARCHAR(500) NULL,
    note TEXT NULL,

    display_order INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (item_id),

    KEY idx_itinerary_items_itinerary (itinerary_id),

    KEY idx_itinerary_items_timeline (
        itinerary_id,
        day_number,
        display_order,
        start_time
    ),

    KEY idx_itinerary_items_activity (activity_id),
    KEY idx_itinerary_items_homestay (homestay_id),

    CONSTRAINT fk_itinerary_items_itinerary
        FOREIGN KEY (itinerary_id)
        REFERENCES itineraries(itinerary_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,

    CONSTRAINT fk_itinerary_items_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(activity_id)
        ON DELETE SET NULL
        ON UPDATE RESTRICT,

    CONSTRAINT fk_itinerary_items_homestay
        FOREIGN KEY (homestay_id)
        REFERENCES homestays(home_id)
        ON DELETE SET NULL
        ON UPDATE RESTRICT
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;
 
-- ALTER TABLE payments
-- ADD COLUMN refund_amount DECIMAL(12,2) NULL,
-- ADD COLUMN refund_status VARCHAR(50) NULL,
-- ADD COLUMN refund_transaction_code VARCHAR(80) NULL,
-- ADD COLUMN refund_note VARCHAR(500) NULL,
-- ADD COLUMN refunded_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE users
ADD COLUMN host_subscription_status VARCHAR(30) NULL
    COMMENT 'TRIAL, ACTIVE, OVERDUE, SUSPENDED',
ADD COLUMN host_subscription_expires_at DATE NULL
    COMMENT 'Ngày hết hạn phí duy trì',
ADD COLUMN host_can_receive_booking BOOLEAN NOT NULL DEFAULT TRUE
    COMMENT 'Host có được nhận booking mới hay không';
    
CREATE TABLE platform_fee_settings (
    setting_id BIGINT NOT NULL AUTO_INCREMENT,

    setting_name VARCHAR(150) NOT NULL,

    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00
        COMMENT 'Tỷ lệ phần trăm, ví dụ 10.00 là 10%',

    monthly_maintenance_fee DECIMAL(14,2) NOT NULL DEFAULT 99000,

    free_trial_days INT NOT NULL DEFAULT 30,
    grace_period_days INT NOT NULL DEFAULT 3,

    effective_from DATE NOT NULL,
    effective_to DATE NULL,

    setting_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
        COMMENT 'ACTIVE, INACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (setting_id),

    KEY idx_platform_fee_status_date (
        setting_status,
        effective_from,
        effective_to
    )
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

INSERT INTO platform_fee_settings (
    setting_name,
    commission_rate,
    monthly_maintenance_fee,
    free_trial_days,
    grace_period_days,
    effective_from,
    effective_to,
    setting_status
)
VALUES (
    'Phí mặc định Cozygo',
    10.00,
    99000,
    30,
    3,
    CURRENT_DATE,
    NULL,
    'ACTIVE'
);

CREATE TABLE booking_commissions (
    commission_id BIGINT NOT NULL AUTO_INCREMENT,

    booking_id INT NOT NULL,
    host_id INT NOT NULL,

    booking_amount DECIMAL(14,2) NOT NULL DEFAULT 0
        COMMENT 'Tổng tiền booking dùng để tính phí',

    commission_rate DECIMAL(5,2) NOT NULL
        COMMENT 'Tỷ lệ được chốt tại thời điểm tạo hoa hồng',

    commission_amount DECIMAL(14,2) NOT NULL DEFAULT 0
        COMMENT 'Tiền hoa hồng sàn nhận',

    host_receivable_amount DECIMAL(14,2) NOT NULL DEFAULT 0
        COMMENT 'Số tiền host được nhận sau khi trừ hoa hồng',

    commission_status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        COMMENT 'PENDING, RECOGNIZED, CANCELLED, PAID_OUT',

    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recognized_at TIMESTAMP NULL,
    paid_to_host_at TIMESTAMP NULL,

    admin_note TEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (commission_id),

    UNIQUE KEY uk_booking_commissions_booking (booking_id),

    KEY idx_booking_commissions_host (host_id),
    KEY idx_booking_commissions_status (commission_status),
    KEY idx_booking_commissions_recognized_at (recognized_at),

    CONSTRAINT fk_booking_commissions_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,

    CONSTRAINT fk_booking_commissions_host
        FOREIGN KEY (host_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE host_maintenance_fees (
    maintenance_fee_id BIGINT NOT NULL AUTO_INCREMENT,

    host_id INT NOT NULL,

    billing_month TINYINT NOT NULL,
    billing_year SMALLINT NOT NULL,

    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    fee_amount DECIMAL(14,2) NOT NULL,

    due_date DATE NOT NULL,

    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        COMMENT 'PENDING, PAID, OVERDUE, WAIVED, CANCELLED',

    paid_at TIMESTAMP NULL,

    payment_method VARCHAR(30) NULL
        COMMENT 'BANK_TRANSFER, VNPAY, CASH, ADMIN_CONFIRM',

    transaction_reference VARCHAR(150) NULL,

    admin_note TEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (maintenance_fee_id),

    UNIQUE KEY uk_host_maintenance_month (
        host_id,
        billing_year,
        billing_month
    ),

    KEY idx_host_maintenance_status_due (
        payment_status,
        due_date
    ),

    KEY idx_host_maintenance_host (
        host_id,
        billing_year,
        billing_month
    ),

    CONSTRAINT fk_host_maintenance_fees_host
        FOREIGN KEY (host_id)ont
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

ALTER TABLE promotion_users
ADD COLUMN granted_at TIMESTAMP NOT NULL
    DEFAULT CURRENT_TIMESTAMP
    COMMENT 'Thời điểm user được cấp mã',

ADD COLUMN valid_from DATETIME NOT NULL
    DEFAULT CURRENT_TIMESTAMP
    COMMENT 'Thời điểm bắt đầu được sử dụng',

ADD COLUMN valid_until DATETIME NULL
    COMMENT 'Hạn sử dụng riêng của user',

ADD COLUMN user_promotion_status VARCHAR(30)
    NOT NULL DEFAULT 'ACTIVE'
    COMMENT 'ACTIVE, USED_UP, EXPIRED, REVOKED',

ADD COLUMN granted_reason VARCHAR(100) NULL
    COMMENT 'TIER_UPGRADE, ADMIN_GRANT, CAMPAIGN',

ADD COLUMN granted_tier_id INT NULL
    COMMENT 'Hạng tại thời điểm được cấp',

ADD COLUMN usage_limit INT NOT NULL DEFAULT 1
    COMMENT 'Số lần user được dùng quyền này',

ADD COLUMN used_count INT NOT NULL DEFAULT 0
    COMMENT 'Số lần đã sử dụng';

    
ALTER TABLE promotion_users
ADD UNIQUE KEY uk_promotion_user (
    promotion_id,
    user_id
);


ALTER TABLE promotion_tiers
ADD COLUMN validity_days INT NOT NULL DEFAULT 30
    COMMENT 'Số ngày user được sử dụng sau khi mở khóa';

UPDATE promotion_tiers pt
JOIN loyalty_tiers lt
    ON lt.tier_id = pt.tier_id
SET pt.validity_days =
    CASE lt.tier_code
        WHEN 'BRONZE' THEN 30
        WHEN 'SILVER' THEN 90
        WHEN 'GOLD' THEN 180
        WHEN 'DIAMOND' THEN 270
        ELSE 30
    END
WHERE pt.promotion_id > 0;

ALTER TABLE promotions
MODIFY COLUMN start_date DATE NULL,
MODIFY COLUMN end_date DATE NULL;

UPDATE promotions
SET start_date = NULL,
    end_date = NULL,
    status = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP
WHERE promotion_id > 0
  AND promotion_scope = 'TIER';

ALTER TABLE promotion_users
ADD COLUMN updated_at DATETIME NOT NULL
DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP;


use lvtn;
INSERT INTO activities (
    activity_name,
    province,
    city,
    activity_address,
    latitude,
    longitude,
    short_description,
    description,
    hotline,
    thumbnail_url,
    badge_text,
    badge_type,
    activity_status,
    is_featured,
    display_order,
    created_by,
    opening_time,
    closing_time,
    recommended_duration_minutes,
    best_time_of_day,
    activity_intensity,
    estimated_cost_min,
    estimated_cost_max,
    activity_tags,
    suitable_group_types,
    suitable_travel_styles
)
VALUES

-- =========================================================
-- 1. CẦN THƠ
-- =========================================================

(
    'Khám phá chợ nổi Cái Răng bằng thuyền',
    'Cần Thơ',
    'Cần Thơ',
    '2P3W+42X, đường Võ Tánh, phường Lê Bình, quận Cái Răng, thành phố Cần Thơ',
    10.0028540,
    105.7451017,
    'Đi thuyền giữa chợ nổi, ngắm ghe buôn bán và trải nghiệm nhịp sống sông nước miền Tây.',
    'Du khách đi thuyền tham quan chợ nổi Cái Răng vào buổi sáng, quan sát hoạt động mua bán nông sản trên sông, thưởng thức món ăn và cà phê trên ghe, chụp ảnh bình minh và tìm hiểu văn hóa giao thương đặc trưng của vùng Đồng bằng sông Cửu Long.',
    NULL,
    '/images/activities/chonoi.jpg',
    'Sông nước',
    'WATER',
    'ACTIVE',
    1,
    11,
    NULL,
    '04:00:00',
    '09:00:00',
    180,
    'MORNING',
    'LIGHT',
    50000.00,
    150000.00,
    '["floating_market","river","local_food","mekong","local_culture","boat"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["DISCOVERY","CULTURE","LOCAL_EXPERIENCE","RELAXING"]'
),

(
    'Trải nghiệm du lịch cộng đồng Cồn Sơn',
    'Cần Thơ',
    'Cần Thơ',
    'Khu vực I, phường Bình Thủy, thành phố Cần Thơ; đi đò từ bến Cô Bắc, hẻm 13 đường Lê Hồng Phong',
    10.0845300,
    105.7504800,
    'Khám phá cù lao giữa sông Hậu với vườn trái cây, bè cá và các trải nghiệm dân gian miền Tây.',
    'Du khách đi đò sang Cồn Sơn, tham quan vườn cây ăn trái, bè cá, thưởng thức bánh dân gian, tìm hiểu đời sống của người dân trên cù lao và có thể xem các hoạt động đặc trưng của mô hình du lịch cộng đồng địa phương.',
    '02923841512',
    '/images/activities/conson.jpg',
    'Miệt vườn',
    'LOCAL',
    'ACTIVE',
    1,
    12,
    NULL,
    '07:00:00',
    '18:00:00',
    240,
    'MORNING',
    'MEDIUM',
    100000.00,
    300000.00,
    '["community_tourism","fruit_garden","river","fish_farm","local_food","mekong"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["LOCAL_EXPERIENCE","NATURE","CULTURE","DISCOVERY"]'
),

(
    'Trải nghiệm làm cacao tại vườn Mười Cương',
    'Cần Thơ',
    'Cần Thơ',
    'XPQ5+MMV, ấp Mỹ Ái, xã Mỹ Khánh, huyện Phong Điền, thành phố Cần Thơ',
    9.9892444,
    105.7091827,
    'Tham quan vườn cacao và tìm hiểu cách chế biến cacao, chocolate thủ công.',
    'Du khách tham quan vườn cacao Mười Cương, tìm hiểu quá trình trồng, thu hoạch và chế biến trái cacao thành các sản phẩm như bột cacao và chocolate, đồng thời trải nghiệm không gian miệt vườn Phong Điền.',
    '0939427589',
    '/images/activities/vuoncacao.jpg',
    'Nông trại',
    'FARM',
    'ACTIVE',
    1,
    13,
    NULL,
    '07:00:00',
    '12:00:00',
    150,
    'MORNING',
    'LIGHT',
    50000.00,
    200000.00,
    '["cacao","chocolate","farm","local_product","fruit_garden","workshop"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["LOCAL_EXPERIENCE","NATURE","CULTURE","DISCOVERY"]'
),

-- =========================================================
-- 2. ĐÀ LẠT - LÂM ĐỒNG
-- =========================================================

(
    'Săn mây và khám phá đồi chè Cầu Đất',
    'Lâm Đồng',
    'Đà Lạt',
    'Quốc lộ 20, xã Xuân Trường, thành phố Đà Lạt, tỉnh Lâm Đồng',
    11.8822500,
    108.5574800,
    'Dạo đồi chè xanh, ngắm cảnh cao nguyên và săn mây vào sáng sớm.',
    'Trải nghiệm không gian đồi chè Cầu Đất với những luống chè trải dài trên cao nguyên, chụp ảnh phong cảnh, ngắm bình minh và tìm hiểu vùng sản xuất chè nổi tiếng ở ngoại ô Đà Lạt.',
    NULL,
    '/images/activities/caudatteahill.jpg',
    'Cao nguyên',
    'FARM',
    'ACTIVE',
    1,
    14,
    NULL,
    '06:00:00',
    '17:00:00',
    180,
    'MORNING',
    'MEDIUM',
    0.00,
    100000.00,
    '["tea_hill","cloud_hunting","nature","photography","highland","tea"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["NATURE","DISCOVERY","RELAXING","LOCAL_EXPERIENCE"]'
),

(
    'Tham quan Làng hoa Vạn Thành',
    'Lâm Đồng',
    'Đà Lạt',
    '43 Vạn Thành, Phường 5, thành phố Đà Lạt, tỉnh Lâm Đồng',
    11.9475800,
    108.4084500,
    'Khám phá làng trồng hoa lâu đời và tìm hiểu nghề trồng hoa đặc trưng của Đà Lạt.',
    'Du khách đi giữa các khu trồng hoa, tìm hiểu phương pháp chăm sóc nhiều giống hoa đặc trưng của Đà Lạt, chụp ảnh và quan sát hoạt động sản xuất của người dân làng hoa.',
    '0263535699',
    '/images/activities/langhoavanthanh.jpg',
    'Làng hoa',
    'FARM',
    'ACTIVE',
    1,
    15,
    NULL,
    '07:00:00',
    '17:00:00',
    120,
    'MORNING',
    'LIGHT',
    20000.00,
    40000.00,
    '["flower_village","flower_farm","photography","agriculture","local_culture"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["RELAXING","NATURE","LOCAL_EXPERIENCE","DISCOVERY"]'
),

(
    'Hái dâu tại Ichigo Strawberry Farm',
    'Lâm Đồng',
    'Đà Lạt',
    '100 Cam Ly, Phường 7, thành phố Đà Lạt, tỉnh Lâm Đồng',
    11.9665316,
    108.3937345,
    'Tham quan vườn dâu và trải nghiệm hái dâu trực tiếp tại Đà Lạt.',
    'Du khách tham quan khu trồng dâu, tìm hiểu cách chăm sóc dâu trong điều kiện khí hậu Đà Lạt, tự chọn và hái dâu tại vườn khi đúng mùa, đồng thời thưởng thức hoặc mua nông sản địa phương.',
    '0924979799',
    '/images/activities/ichigostrawberryfarm.jpg',
    'Nông trại',
    'FARM',
    'ACTIVE',
    1,
    16,
    NULL,
    '07:00:00',
    '18:00:00',
    120,
    'MORNING',
    'LIGHT',
    10000.00,
    350000.00,
    '["strawberry","fruit_picking","farm","agriculture","local_food","photography"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["NATURE","LOCAL_EXPERIENCE","RELAXING","FAMILY"]'
),

-- =========================================================
-- 3. ĐÀ NẴNG
-- =========================================================

(
    'Khám phá nghề điêu khắc đá Non Nước',
    'Đà Nẵng',
    'Đà Nẵng',
    '60 Huyền Trân Công Chúa, phường Hòa Hải, quận Ngũ Hành Sơn, thành phố Đà Nẵng',
    16.0009500,
    108.2666400,
    'Tham quan làng nghề đá truyền thống và quan sát nghệ nhân chế tác sản phẩm mỹ nghệ.',
    'Du khách khám phá làng đá mỹ nghệ Non Nước dưới chân Ngũ Hành Sơn, quan sát các công đoạn tạo hình, chạm khắc và hoàn thiện sản phẩm đá, tìm hiểu lịch sử làng nghề và lựa chọn sản phẩm thủ công làm quà.',
    '0814347213',
    '/images/activities/dieukhacdanonnuoc.jpg',
    'Làng nghề',
    'CRAFT',
    'ACTIVE',
    1,
    17,
    NULL,
    '07:30:00',
    '17:30:00',
    120,
    'MORNING',
    'LIGHT',
    0.00,
    200000.00,
    '["stone_carving","craft_village","handicraft","culture","artisan","souvenir"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["CULTURE","LOCAL_EXPERIENCE","DISCOVERY"]'
),

(
    'Tham quan làng nước mắm Nam Ô',
    'Đà Nẵng',
    'Đà Nẵng',
    'Làng Nam Ô, phường Hòa Hiệp Nam, quận Liên Chiểu, thành phố Đà Nẵng',
    16.1128300,
    108.1300900,
    'Tìm hiểu nghề làm nước mắm truyền thống của làng chài Nam Ô.',
    'Du khách ghé làng Nam Ô để tìm hiểu quy trình làm nước mắm từ cá cơm, tham quan không gian làng chài ven biển, tìm hiểu đời sống ngư dân và các sản phẩm đặc trưng của địa phương.',
    NULL,
    '/images/activities/nuocmamnamo.jpg',
    'Làng chài',
    'LOCAL',
    'ACTIVE',
    1,
    18,
    NULL,
    '07:30:00',
    '17:00:00',
    120,
    'MORNING',
    'LIGHT',
    0.00,
    150000.00,
    '["fish_sauce","fishing_village","sea","traditional_craft","local_food","culture"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["CULTURE","LOCAL_EXPERIENCE","DISCOVERY"]'
),

(
    'Ngắm bình minh và tắm biển Mỹ Khê',
    'Đà Nẵng',
    'Đà Nẵng',
    'Bãi biển Mỹ Khê, đường Võ Nguyên Giáp, phường Phước Mỹ, quận Sơn Trà, thành phố Đà Nẵng',
    16.0700000,
    108.2461111,
    'Ngắm bình minh, đi bộ trên bãi cát và trải nghiệm không khí biển Đà Nẵng.',
    'Du khách có thể bắt đầu ngày mới tại biển Mỹ Khê với hoạt động ngắm bình minh, đi bộ hoặc chạy nhẹ trên bãi biển, tắm biển trong khu vực được phép và thưởng thức không khí ven biển đặc trưng của Đà Nẵng.',
    NULL,
    '/images/activities/mykhe.jpg',
    'Biển',
    'SEA',
    'ACTIVE',
    1,
    19,
    NULL,
    '06:00:00',
    '18:00:00',
    120,
    'MORNING',
    'LIGHT',
    0.00,
    100000.00,
    '["beach","sunrise","swimming","sea","walking","photography"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["RELAXING","NATURE","DISCOVERY"]'
),

-- =========================================================
-- 4. HUẾ
-- =========================================================

(
    'Trải nghiệm làm hương tại Làng hương Thủy Xuân',
    'Huế',
    'Huế',
    '84 Huyền Trân Công Chúa, phường Thủy Xuân, thành phố Huế',
    16.4359000,
    107.5760000,
    'Khám phá làng hương truyền thống và tìm hiểu các công đoạn làm hương thủ công.',
    'Du khách tham quan những gian hàng hương nhiều màu sắc tại Thủy Xuân, tìm hiểu cách làm hương truyền thống, quan sát người dân se hương và chụp ảnh trong không gian làng nghề đặc trưng của Huế.',
    NULL,
    '/images/activities/langhuongthuyxuan.jpg',
    'Làng nghề',
    'CRAFT',
    'ACTIVE',
    1,
    20,
    NULL,
    '07:30:00',
    '17:30:00',
    120,
    'MORNING',
    'LIGHT',
    0.00,
    100000.00,
    '["incense","craft_village","handicraft","culture","photography","hue"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["CULTURE","LOCAL_EXPERIENCE","RELAXING"]'
),

(
    'Làm gốm và bánh truyền thống tại Làng cổ Phước Tích',
    'Huế',
    'Huế',
    'Thôn Phước Phú, xã Phong Hòa, huyện Phong Điền, khu vực Huế',
    16.6382400,
    107.3099400,
    'Khám phá làng cổ, nhà rường và các nghề thủ công truyền thống của Phước Tích.',
    'Du khách dạo quanh làng cổ Phước Tích, tham quan nhà rường, tìm hiểu kiến trúc làng quê truyền thống và có thể tham gia các chương trình trải nghiệm như làm gốm, làm bánh hoặc trò chơi dân gian tùy thời điểm tổ chức.',
    NULL,
    '/images/activities/langcophuoctich.jpg',
    'Di sản',
    'CULTURE',
    'ACTIVE',
    1,
    21,
    NULL,
    '08:00:00',
    '17:00:00',
    180,
    'MORNING',
    'LIGHT',
    50000.00,
    300000.00,
    '["ancient_village","pottery","traditional_cake","heritage","culture","craft"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["CULTURE","LOCAL_EXPERIENCE","DISCOVERY","RELAXING"]'
),

(
    'Ngắm bình minh và khám phá Đầm Chuồn',
    'Huế',
    'Huế',
    'Đầm Chuồn, xã Phú An, huyện Phú Vang, khu vực Huế',
    16.5283486,
    107.6392892,
    'Khám phá cảnh quan đầm phá, đời sống ngư dân và ẩm thực vùng Đầm Chuồn.',
    'Du khách đến Đầm Chuồn để ngắm cảnh đầm phá Tam Giang, quan sát hoạt động đánh bắt thủy sản của người dân, đi thuyền khi có dịch vụ phù hợp và thưởng thức các món hải sản địa phương.',
    NULL,
    '/images/activities/damchuon.jpg',
    'Đầm phá',
    'WATER',
    'ACTIVE',
    1,
    22,
    NULL,
    '06:00:00',
    '18:00:00',
    180,
    'MORNING',
    'LIGHT',
    50000.00,
    250000.00,
    '["lagoon","fishing","sunrise","seafood","local_life","nature"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["NATURE","LOCAL_EXPERIENCE","DISCOVERY","RELAXING"]'
),

-- =========================================================
-- 5. TRÀ VINH
-- Giữ tên Trà Vinh theo dữ liệu địa danh của project để test
-- =========================================================

(
    'Dạo Ao Bà Om và tìm hiểu văn hóa Khmer',
    'Trà Vinh',
    'Trà Vinh',
    'Ao Bà Om, Khóm 4, Phường 8, thành phố Trà Vinh, tỉnh Trà Vinh',
    9.9177100,
    106.3040300,
    'Dạo quanh ao cổ, hàng cây cổ thụ và khám phá không gian văn hóa Khmer Nam Bộ.',
    'Du khách tham quan Ao Bà Om, đi bộ dưới những hàng cây cổ thụ, tìm hiểu truyền thuyết địa phương và kết hợp khám phá các công trình văn hóa Khmer nằm trong khu vực lân cận.',
    NULL,
    '/images/activities/aobaom.jpg',
    'Văn hóa Khmer',
    'CULTURE',
    'ACTIVE',
    1,
    23,
    NULL,
    '06:00:00',
    '18:00:00',
    120,
    'MORNING',
    'LIGHT',
    0.00,
    50000.00,
    '["khmer_culture","pond","heritage","ancient_trees","local_culture","walking"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["CULTURE","RELAXING","LOCAL_EXPERIENCE","DISCOVERY"]'
),

(
    'Tham quan làng nghề bánh tét Trà Cuôn',
    'Trà Vinh',
    'Trà Vinh',
    'Ấp Trà Cuôn, xã Kim Hòa, huyện Cầu Ngang, tỉnh Trà Vinh, dọc Quốc lộ 53',
    9.8569444,
    106.4063889,
    'Khám phá làng nghề bánh tét nổi tiếng và quan sát quy trình làm bánh truyền thống.',
    'Du khách ghé làng nghề bánh tét Trà Cuôn để xem người dân chuẩn bị nếp, đậu xanh, nhân bánh, gói và nấu bánh theo cách truyền thống, đồng thời có thể mua các loại bánh tét địa phương làm quà.',
    NULL,
    '/images/activities/banhtettracuon.jpg',
    'Ẩm thực',
    'FOOD',
    'ACTIVE',
    1,
    24,
    NULL,
    '07:00:00',
    '17:00:00',
    120,
    'MORNING',
    'LIGHT',
    50000.00,
    150000.00,
    '["banh_tet","traditional_food","craft_village","local_food","cooking","culture"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["LOCAL_EXPERIENCE","CULTURE","DISCOVERY"]'
),

(
    'Trải nghiệm du lịch cộng đồng Cồn Chim',
    'Trà Vinh',
    'Trà Vinh',
    'WCCF+482, Cồn Chim, xã Hòa Minh, huyện Châu Thành, tỉnh Trà Vinh',
    9.9202712,
    106.4232557,
    'Trải nghiệm cuộc sống sông nước, câu cua, trò chơi dân gian và ẩm thực tại Cồn Chim.',
    'Du khách khám phá mô hình du lịch cộng đồng Cồn Chim, trải nghiệm cảnh quan sông nước, tham gia các hoạt động dân gian, tìm hiểu cách người dân đánh bắt thủy sản như câu cua và đặt lú, đồng thời thưởng thức món ăn địa phương.',
    NULL,
    '/images/activities/conchim.jpg',
    'Cộng đồng',
    'LOCAL',
    'ACTIVE',
    1,
    25,
    NULL,
    '07:00:00',
    '17:00:00',
    240,
    'MORNING',
    'MEDIUM',
    150000.00,
    350000.00,
    '["community_tourism","crab_fishing","river","folk_game","local_food","mekong"]',
    '["FAMILY","COUPLE","FRIENDS"]',
    '["LOCAL_EXPERIENCE","NATURE","CULTURE","DISCOVERY"]'
),

-- =========================================================
-- 6. BẾN TRE
-- Giữ tên Bến Tre theo dữ liệu địa danh của project để test
-- =========================================================

(
    'Trải nghiệm trò chơi dân gian tại Lan Vương',
    'Bến Tre',
    'Bến Tre',
    'ĐT887, Ấp 2, xã Phú Nhuận, thành phố Bến Tre, tỉnh Bến Tre',
    10.2085801,
    106.3706958,
    'Hóa thân thành người miền Tây và tham gia các trò chơi dân gian sông nước.',
    'Du khách đến Lan Vương có thể tham gia các trò chơi vận động và hoạt động ngoài trời trong không gian sinh thái miền Tây, mặc áo bà ba, vui chơi theo nhóm và thưởng thức ẩm thực địa phương.',
    '0888544898',
    '/images/activities/lanvuong.jpg',
    'Miền Tây',
    'LOCAL',
    'ACTIVE',
    1,
    26,
    NULL,
    '07:00:00',
    '18:00:00',
    240,
    'MORNING',
    'MEDIUM',
    50000.00,
    300000.00,
    '["folk_game","mekong","team_building","local_food","water_game","local_experience"]',
    '["FAMILY","FRIENDS","COUPLE"]',
    '["LOCAL_EXPERIENCE","ADVENTURE","CULTURE","DISCOVERY"]'
),

(
    'Tát mương bắt cá và làm bánh tại Phú An Khang',
    'Bến Tre',
    'Bến Tre',
    'Số 319, ấp Phú Lợi, xã Bình Phú, thành phố Bến Tre, tỉnh Bến Tre',
    10.2420991,
    106.3436278,
    'Trải nghiệm miệt vườn với chèo xuồng, cầu tre, bắt cá và làm món bánh Nam Bộ.',
    'Du khách tham quan vườn cây ăn trái Phú An Khang, bơi xuồng, đi cầu tre, tham gia tát mương bắt cá và trải nghiệm làm các món bánh dân gian như bánh xèo hoặc bánh chuối tùy chương trình phục vụ.',
    '02753838686',
    '/images/activities/phu-an-khang.jpg',
    'Miệt vườn',
    'FARM',
    'ACTIVE',
    1,
    27,
    NULL,
    '07:00:00',
    '18:00:00',
    240,
    'MORNING',
    'MEDIUM',
    50000.00,
    300000.00,
    '["fruit_garden","ditch_fishing","boat","cooking","folk_game","agriculture"]',
    '["FAMILY","FRIENDS","COUPLE"]',
    '["LOCAL_EXPERIENCE","NATURE","ADVENTURE","FAMILY"]'
),

(
    'Khám phá đời sống sông nước tại Khu du lịch Làng Bè',
    'Bến Tre',
    'Bến Tre',
    '81B/6B, ấp An Thới B, xã An Khánh, huyện Châu Thành, tỉnh Bến Tre',
    10.3274450,
    106.3514793,
    'Trải nghiệm nghề nuôi cá bè và các trò chơi dân gian đặc trưng của miền Tây.',
    'Du khách khám phá cảnh quan sông nước Bến Tre, tìm hiểu nghề nuôi cá bè của người dân địa phương, mặc áo bà ba và tham gia các trò chơi như đạp xe qua cầu hẹp, đi cầu khỉ, đu dây và các hoạt động vận động dưới nước.',
    '0949798822',
    '/images/activities/lang-be.jpg',
    'Sông nước',
    'WATER',
    'ACTIVE',
    1,
    28,
    NULL,
    '07:00:00',
    '21:00:00',
    240,
    'MORNING',
    'MEDIUM',
    20000.00,
    250000.00,
    '["fish_farm","river","folk_game","water_game","mekong","local_life"]',
    '["FAMILY","FRIENDS","COUPLE"]',
    '["LOCAL_EXPERIENCE","ADVENTURE","NATURE","DISCOVERY"]'
);

UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/chonoi/cover.jpg' WHERE (`activity_id` = '11');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/conson/cover.jpg' WHERE (`activity_id` = '12');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/vuoncacao/cover.jpg' WHERE (`activity_id` = '13');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/caudatteahill/cover.jpg' WHERE (`activity_id` = '14');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/langhoavanthanh/cover.jpg' WHERE (`activity_id` = '15');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/ichigostrawberryfarm/cover.jpg' WHERE (`activity_id` = '16');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/dieukhacdanonnuoc/cover.jpg' WHERE (`activity_id` = '17');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/nuocmamnamo/cover.jpg' WHERE (`activity_id` = '18');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/mykhe/cover.jpg' WHERE (`activity_id` = '19');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/langhuongthuyxuan/cover.jpg' WHERE (`activity_id` = '20');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/langcophuoctich/cover.jpg' WHERE (`activity_id` = '21');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/damchuon/cover.jpg' WHERE (`activity_id` = '22');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/aobaom/cover.jpg' WHERE (`activity_id` = '23');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/banhtettracuon/cover.jpg' WHERE (`activity_id` = '24');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/conchim/cover.jpg' WHERE (`activity_id` = '25');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/lanvuong/cover.jpg' WHERE (`activity_id` = '26');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/phu-an-khang/cover.jpg' WHERE (`activity_id` = '27');
UPDATE `lvtn`.`activities` SET `thumbnail_url` = '/images/activities/lang-be/cover.jpg' WHERE (`activity_id` = '28');


INSERT INTO activity_images (
    activity_id,
    image_url,
    is_thumbnail,
    display_order,
    created_at
)
VALUES

-- =========================================================
-- CẦN THƠ
-- =========================================================

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Khám phá chợ nổi Cái Răng bằng thuyền'
     LIMIT 1),
    '/images/activities/cantho/cho-noi-cai-rang/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Khám phá chợ nổi Cái Răng bằng thuyền'
     LIMIT 1),
    '/images/activities/cantho/cho-noi-cai-rang/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Khám phá chợ nổi Cái Răng bằng thuyền'
     LIMIT 1),
    '/images/activities/cantho/cho-noi-cai-rang/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm du lịch cộng đồng Cồn Sơn'
     LIMIT 1),
    '/images/activities/cantho/con-son/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm du lịch cộng đồng Cồn Sơn'
     LIMIT 1),
    '/images/activities/cantho/con-son/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm du lịch cộng đồng Cồn Sơn'
     LIMIT 1),
    '/images/activities/cantho/con-son/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm làm cacao tại vườn Mười Cương'
     LIMIT 1),
    '/images/activities/cantho/cacao-muoi-cuong/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm làm cacao tại vườn Mười Cương'
     LIMIT 1),
    '/images/activities/cantho/cacao-muoi-cuong/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm làm cacao tại vườn Mười Cương'
     LIMIT 1),
    '/images/activities/cantho/cacao-muoi-cuong/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

-- =========================================================
-- ĐÀ LẠT
-- =========================================================

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Săn mây và khám phá đồi chè Cầu Đất'
     LIMIT 1),
    '/images/activities/dalat/cau-dat-tea-hill/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Săn mây và khám phá đồi chè Cầu Đất'
     LIMIT 1),
    '/images/activities/dalat/cau-dat-tea-hill/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Săn mây và khám phá đồi chè Cầu Đất'
     LIMIT 1),
    '/images/activities/dalat/cau-dat-tea-hill/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tham quan Làng hoa Vạn Thành'
     LIMIT 1),
    '/images/activities/dalat/lang-hoa-van-thanh/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tham quan Làng hoa Vạn Thành'
     LIMIT 1),
    '/images/activities/dalat/lang-hoa-van-thanh/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tham quan Làng hoa Vạn Thành'
     LIMIT 1),
    '/images/activities/dalat/lang-hoa-van-thanh/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Hái dâu tại Ichigo Strawberry Farm'
     LIMIT 1),
    '/images/activities/dalat/ichigo-strawberry-farm/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Hái dâu tại Ichigo Strawberry Farm'
     LIMIT 1),
    '/images/activities/dalat/ichigo-strawberry-farm/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Hái dâu tại Ichigo Strawberry Farm'
     LIMIT 1),
    '/images/activities/dalat/ichigo-strawberry-farm/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

-- =========================================================
-- ĐÀ NẴNG
-- =========================================================

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Khám phá nghề điêu khắc đá Non Nước'
     LIMIT 1),
    '/images/activities/danang/lang-da-non-nuoc/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Khám phá nghề điêu khắc đá Non Nước'
     LIMIT 1),
    '/images/activities/danang/lang-da-non-nuoc/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Khám phá nghề điêu khắc đá Non Nước'
     LIMIT 1),
    '/images/activities/danang/lang-da-non-nuoc/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tham quan làng nước mắm Nam Ô'
     LIMIT 1),
    '/images/activities/danang/nuoc-mam-nam-o/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tham quan làng nước mắm Nam Ô'
     LIMIT 1),
    '/images/activities/danang/nuoc-mam-nam-o/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tham quan làng nước mắm Nam Ô'
     LIMIT 1),
    '/images/activities/danang/nuoc-mam-nam-o/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Ngắm bình minh và tắm biển Mỹ Khê'
     LIMIT 1),
    '/images/activities/danang/my-khe-sunrise/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Ngắm bình minh và tắm biển Mỹ Khê'
     LIMIT 1),
    '/images/activities/danang/my-khe-sunrise/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Ngắm bình minh và tắm biển Mỹ Khê'
     LIMIT 1),
    '/images/activities/danang/my-khe-sunrise/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

-- =========================================================
-- HUẾ
-- =========================================================

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm làm hương tại Làng hương Thủy Xuân'
     LIMIT 1),
    '/images/activities/hue/lang-huong-thuy-xuan/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm làm hương tại Làng hương Thủy Xuân'
     LIMIT 1),
    '/images/activities/hue/lang-huong-thuy-xuan/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm làm hương tại Làng hương Thủy Xuân'
     LIMIT 1),
    '/images/activities/hue/lang-huong-thuy-xuan/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Làm gốm và bánh truyền thống tại Làng cổ Phước Tích'
     LIMIT 1),
    '/images/activities/hue/lang-co-phuoc-tich/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Làm gốm và bánh truyền thống tại Làng cổ Phước Tích'
     LIMIT 1),
    '/images/activities/hue/lang-co-phuoc-tich/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Làm gốm và bánh truyền thống tại Làng cổ Phước Tích'
     LIMIT 1),
    '/images/activities/hue/lang-co-phuoc-tich/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Ngắm bình minh và khám phá Đầm Chuồn'
     LIMIT 1),
    '/images/activities/hue/dam-chuon/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Ngắm bình minh và khám phá Đầm Chuồn'
     LIMIT 1),
    '/images/activities/hue/dam-chuon/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Ngắm bình minh và khám phá Đầm Chuồn'
     LIMIT 1),
    '/images/activities/hue/dam-chuon/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

-- =========================================================
-- TRÀ VINH
-- =========================================================

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Dạo Ao Bà Om và tìm hiểu văn hóa Khmer'
     LIMIT 1),
    '/images/activities/travinh/ao-ba-om/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Dạo Ao Bà Om và tìm hiểu văn hóa Khmer'
     LIMIT 1),
    '/images/activities/travinh/ao-ba-om/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Dạo Ao Bà Om và tìm hiểu văn hóa Khmer'
     LIMIT 1),
    '/images/activities/travinh/ao-ba-om/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tham quan làng nghề bánh tét Trà Cuôn'
     LIMIT 1),
    '/images/activities/travinh/banh-tet-tra-cuon/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tham quan làng nghề bánh tét Trà Cuôn'
     LIMIT 1),
    '/images/activities/travinh/banh-tet-tra-cuon/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tham quan làng nghề bánh tét Trà Cuôn'
     LIMIT 1),
    '/images/activities/travinh/banh-tet-tra-cuon/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm du lịch cộng đồng Cồn Chim'
     LIMIT 1),
    '/images/activities/travinh/con-chim/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm du lịch cộng đồng Cồn Chim'
     LIMIT 1),
    '/images/activities/travinh/con-chim/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm du lịch cộng đồng Cồn Chim'
     LIMIT 1),
    '/images/activities/travinh/con-chim/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

-- =========================================================
-- BẾN TRE
-- =========================================================

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm trò chơi dân gian tại Lan Vương'
     LIMIT 1),
    '/images/activities/bentre/lan-vuong/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm trò chơi dân gian tại Lan Vương'
     LIMIT 1),
    '/images/activities/bentre/lan-vuong/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Trải nghiệm trò chơi dân gian tại Lan Vương'
     LIMIT 1),
    '/images/activities/bentre/lan-vuong/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tát mương bắt cá và làm bánh tại Phú An Khang'
     LIMIT 1),
    '/images/activities/bentre/phu-an-khang/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tát mương bắt cá và làm bánh tại Phú An Khang'
     LIMIT 1),
    '/images/activities/bentre/phu-an-khang/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Tát mương bắt cá và làm bánh tại Phú An Khang'
     LIMIT 1),
    '/images/activities/bentre/phu-an-khang/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
),

(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Khám phá đời sống sông nước tại Khu du lịch Làng Bè'
     LIMIT 1),
    '/images/activities/bentre/lang-be/cover.jpg',
    1, 1, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Khám phá đời sống sông nước tại Khu du lịch Làng Bè'
     LIMIT 1),
    '/images/activities/bentre/lang-be/img1.jpg',
    0, 2, CURRENT_TIMESTAMP
),
(
    (SELECT activity_id FROM activities
     WHERE activity_name = 'Khám phá đời sống sông nước tại Khu du lịch Làng Bè'
     LIMIT 1),
    '/images/activities/bentre/lang-be/img2.jpg',
    0, 3, CURRENT_TIMESTAMP
);
///////////////////////Mới sửa mqh

ALTER TABLE itinerary_items
    DROP FOREIGN KEY fk_itinerary_items_homestay,
    DROP COLUMN homestay_id;

ALTER TABLE itineraries
    DROP FOREIGN KEY fk_itineraries_selected_home,
    DROP COLUMN selected_home_id;

DROP TABLE destination_itinerary_items;

ALTER TABLE activities
DROP FOREIGN KEY fk_activities_created_by;
ALTER TABLE activities
DROP COLUMN created_by;

ALTER TABLE homestay_services
ADD COLUMN pricing_unit ENUM('PER_DAY', 'PER_USE')
NOT NULL DEFAULT 'PER_DAY'
AFTER price;

UPDATE homestay_services
SET pricing_unit = CASE
    WHEN service_id = 1 THEN 'PER_USE'
    WHEN service_id = 2 THEN 'PER_DAY'
    WHEN service_id = 3 THEN 'PER_USE'
    WHEN service_id = 4 THEN 'PER_DAY'
    WHEN service_id = 5 THEN 'PER_USE'
    ELSE 'PER_DAY'
END
WHERE homestay_service_id > 0;

ALTER TABLE homestays
ADD COLUMN checkin_end_time TIME NULL AFTER checkin_time,
ADD COLUMN checkout_start_time TIME NULL AFTER checkin_end_time;

USE lvtn;

UPDATE homestays
SET
    checkin_end_time = '20:00:00',
    checkout_start_time = '08:00:00'
WHERE home_id IN (6, 7, 8, 9, 10, 11, 12, 13, 14);



-- =========================================================
-- COZYGO CHATBOT DOCUMENTS - RAG KNOWLEDGE
-- PHÙ HỢP LOGIC HIỆN TẠI CỦA HỆ THỐNG
-- Chỉ sử dụng VNPAY và PAY_AT_PROPERTY
-- =========================================================

DELETE FROM chatbot_documents
WHERE title IN (
    'Hướng dẫn đặt phòng',
    'Chính sách đặt phòng',
    'Chính sách hủy và không đến',
    'Chính sách hủy và hoàn tiền',
    'Thanh toán SePay',
    'Thanh toán VNPAY',
    'Thanh toán tại chỗ',
    'Chính sách nhận và trả phòng',
    'Quy trình khiếu nại',
    'Hướng dẫn đánh giá'
);

INSERT INTO chatbot_documents (
    title,
    content,
    document_type,
    status
)
VALUES

-- =========================================================
-- 1. HƯỚNG DẪN ĐẶT PHÒNG
-- =========================================================
(
    'Hướng dẫn đặt phòng',

    'Để đặt homestay trên Cozygo, khách hàng tìm và chọn homestay phù hợp, '
    'chọn ngày nhận phòng, ngày trả phòng và số lượng khách, sau đó nhấn nút Đặt phòng. '
    'Hệ thống sẽ hiển thị bước xác nhận thông tin đặt phòng. '
    'Khách hàng cần kiểm tra và nhập đầy đủ các thông tin được yêu cầu, '
    'có thể chọn thêm dịch vụ và áp dụng mã khuyến mãi nếu có. '
    'Nếu chưa đăng nhập, hệ thống sẽ yêu cầu khách hàng đăng nhập trước khi tiếp tục đặt phòng. '
    'Sau khi xác nhận thông tin, khách hàng lựa chọn phương thức thanh toán được Cozygo hỗ trợ, '
    'gồm thanh toán trực tuyến qua VNPAY hoặc thanh toán trực tiếp tại homestay. '
    'Sau khi đơn được tạo thành công, khách hàng có thể theo dõi mã booking, '
    'trạng thái booking và trạng thái thanh toán trong mục Đặt phòng của tôi.',

    'BOOKING_GUIDE',
    'ACTIVE'
),

-- =========================================================
-- 2. CHÍNH SÁCH ĐẶT PHÒNG
-- =========================================================
(
    'Chính sách đặt phòng',

    'Trước khi xác nhận đặt homestay trên Cozygo, khách hàng cần kiểm tra đầy đủ '
    'thông tin đơn đặt phòng bao gồm homestay, ngày nhận phòng, ngày trả phòng, '
    'số lượng khách, giá phòng, dịch vụ bổ sung, mã khuyến mãi nếu có '
    'và phương thức thanh toán. '
    'Khả năng đặt phòng phụ thuộc vào tình trạng phòng trống của homestay '
    'trong khoảng thời gian khách lựa chọn. '
    'Một booking chỉ được xem là đã được tạo khi hệ thống tạo đơn đặt phòng thành công. '
    'Trạng thái booking và trạng thái thanh toán được quản lý riêng, '
    'do đó khách hàng nên kiểm tra cả hai trạng thái trong mục Đặt phòng của tôi. '
    'Khách hàng cần cung cấp đúng số lượng khách và thông tin đặt phòng. '
    'Ngoài ra, mỗi homestay có thể có giờ nhận phòng, giờ trả phòng '
    'và nội quy lưu trú riêng mà khách hàng cần kiểm tra trước khi đặt.',

    'BOOKING_POLICY',
    'ACTIVE'
),

-- =========================================================
-- 3. CHÍNH SÁCH HỦY VÀ HOÀN TIỀN
-- =========================================================
(
    'Chính sách hủy và hoàn tiền',

    'Khách hàng có thể tự hủy đơn đặt phòng trên Cozygo khi booking vẫn còn '
    'ở trạng thái cho phép hủy và thời điểm hủy phải trước ngày nhận phòng ít nhất 1 ngày. '
    'Ví dụ, nếu ngày nhận phòng là ngày 20 thì khách vẫn có thể hủy trong ngày 19, '
    'nhưng không thể tự hủy từ ngày 20 trở đi. '

    'Hệ thống không cho phép khách tự hủy booking đã ở các trạng thái '
    'CANCELLED, EXPIRED, COMPLETED hoặc NO_SHOW. '

    'Nếu booking được thanh toán trực tuyến bằng VNPAY và giao dịch đã có trạng thái PAID, '
    'khi booking được hủy hợp lệ, Cozygo ghi nhận hoàn lại 100 phần trăm '
    'số tiền đã thanh toán của giao dịch đó. '
    'Payment được cập nhật sang trạng thái REFUNDED, '
    'refund_status được ghi nhận SUCCESS và refund_amount bằng toàn bộ số tiền đã thanh toán. '
    'Booking đồng thời được cập nhật trạng thái thanh toán thành REFUNDED. '

    'Khi chủ homestay hoặc quản trị viên hủy một booking đã thanh toán thành công bằng VNPAY, '
    'hệ thống cũng áp dụng xử lý hoàn toàn bộ số tiền đã thanh toán. '

    'Đối với phương thức thanh toán tại homestay, nếu khách chưa thanh toán trực tiếp '
    'thì không có khoản thanh toán trực tuyến cần hoàn khi booking bị hủy. '

    'Trong phiên bản hiện tại của Cozygo sử dụng VNPAY Sandbox, '
    'quy trình hoàn tiền được ghi nhận và quản lý trong cơ sở dữ liệu của Cozygo. '
    'Hệ thống hiện chưa thực hiện gọi API hoàn tiền của VNPAY để chuyển tiền hoàn '
    'thực tế về tài khoản thanh toán của khách hàng. '
    'Vì vậy chatbot không được khẳng định rằng tiền đã thực sự được VNPAY '
    'chuyển về tài khoản ngân hàng của khách.',

    'CANCELLATION_POLICY',
    'ACTIVE'
),

-- =========================================================
-- 4. THANH TOÁN VNPAY
-- =========================================================
(
    'Thanh toán VNPAY',

    'VNPAY là phương thức thanh toán trực tuyến được Cozygo tích hợp '
    'cho chức năng đặt homestay. '
    'Trong phạm vi hệ thống hiện tại, Cozygo sử dụng môi trường VNPAY Sandbox '
    'để phục vụ kiểm thử thanh toán. '

    'Khi khách hàng chọn thanh toán bằng VNPAY, hệ thống tạo booking '
    'và giao dịch thanh toán ở trạng thái chờ xử lý, '
    'sau đó tạo đường dẫn thanh toán và chuyển khách sang cổng VNPAY Sandbox. '

    'Khách hàng thực hiện giao dịch trên giao diện VNPAY. '
    'Sau khi giao dịch hoàn tất, Return URL đưa khách trở lại Cozygo '
    'để hiển thị kết quả thanh toán. '
    'Đồng thời, VNPAY gửi IPN đến backend Cozygo để hệ thống '
    'xác thực và xử lý kết quả giao dịch. '

    'Nếu giao dịch được xác nhận thành công, trạng thái payment được cập nhật thành PAID '
    'và booking được cập nhật theo trạng thái tương ứng. '
    'Nếu giao dịch thất bại hoặc bị hủy, hệ thống không ghi nhận giao dịch là đã thanh toán. '

    'Trong trường hợp một booking VNPAY đã thanh toán được hủy hợp lệ, '
    'Cozygo có thể ghi nhận hoàn toàn bộ số tiền trong cơ sở dữ liệu. '
    'Tuy nhiên, phiên bản hiện tại chưa gọi VNPAY Refund API '
    'để thực hiện giao dịch hoàn tiền thực tế qua cổng VNPAY.',

    'PAYMENT_GUIDE',
    'ACTIVE'
),

-- =========================================================
-- 5. THANH TOÁN TẠI HOMESTAY
-- =========================================================
(
    'Thanh toán tại chỗ',

    'Nếu khách hàng chọn thanh toán tại homestay, hệ thống sử dụng '
    'phương thức PAY_AT_PROPERTY. '
    'Khách hàng không cần thanh toán trực tuyến qua VNPAY tại thời điểm đặt phòng. '

    'Booking được tạo và trạng thái thanh toán được giữ ở trạng thái '
    'chờ thanh toán cho đến khi việc thanh toán trực tiếp được xác nhận. '
    'Khách hàng thực hiện thanh toán trực tiếp tại homestay theo quy trình của đơn đặt phòng. '

    'Khách hàng có thể theo dõi phương thức thanh toán, trạng thái booking '
    'và trạng thái thanh toán trong mục Đặt phòng của tôi. '

    'Nếu booking PAY_AT_PROPERTY bị hủy khi khách hàng chưa thực hiện thanh toán, '
    'không có khoản thanh toán trực tuyến nào cần được hoàn lại.',

    'PAYMENT_GUIDE',
    'ACTIVE'
),

-- =========================================================
-- 6. CHÍNH SÁCH NHẬN VÀ TRẢ PHÒNG
-- =========================================================
(
    'Chính sách nhận và trả phòng',

    'Mỗi homestay trên Cozygo có thể thiết lập khung giờ nhận phòng '
    'và khung giờ trả phòng riêng. '
    'Khách hàng cần kiểm tra giờ bắt đầu và kết thúc nhận phòng '
    'cũng như giờ bắt đầu và kết thúc trả phòng '
    'được hiển thị trong thông tin của homestay. '

    'Khách hàng nên đến trong khung giờ nhận phòng mà homestay đã công bố '
    'và hoàn tất trả phòng trong khung giờ quy định. '

    'Nếu có nhu cầu nhận phòng sớm, trả phòng muộn hoặc yêu cầu đặc biệt, '
    'khách hàng cần trao đổi với homestay. '
    'Việc chấp nhận yêu cầu phụ thuộc vào điều kiện thực tế và quyết định của homestay. '

    'Chatbot không được tự cam kết rằng khách chắc chắn được nhận phòng sớm '
    'hoặc trả phòng muộn khi chưa có xác nhận từ homestay.',

    'STAY_POLICY',
    'ACTIVE'
),

-- =========================================================
-- 7. QUY TRÌNH KHIẾU NẠI
-- =========================================================
(
    'Quy trình khiếu nại',

    'Khách hàng có thể gửi khiếu nại đối với đơn đặt phòng '
    'đủ điều kiện trong hệ thống Cozygo. '

    'Khách hàng truy cập mục Đặt phòng của tôi, '
    'chọn đơn đặt phòng đã hoàn thành và sử dụng chức năng gửi khiếu nại '
    'khi chức năng này được hệ thống cho phép. '

    'Khách hàng cần mô tả rõ vấn đề gặp phải và cung cấp '
    'các thông tin cần thiết để hỗ trợ quá trình xử lý. '

    'Các vấn đề liên quan đến thanh toán, hoạt động của hệ thống, '
    'homestay hoặc chủ homestay sẽ được quản trị viên tiếp nhận và xem xét. '

    'Quản trị viên có thể trao đổi và phản hồi kết quả xử lý '
    'cho khách hàng thông qua hệ thống hoặc email.',

    'COMPLAINT_GUIDE',
    'ACTIVE'
),

-- =========================================================
-- 8. HƯỚNG DẪN ĐÁNH GIÁ
-- =========================================================
(
    'Hướng dẫn đánh giá',

    'Khách hàng chỉ có thể gửi đánh giá cho homestay '
    'khi có đơn đặt phòng đáp ứng điều kiện đánh giá của Cozygo. '

    'Đánh giá có thể bao gồm số sao và nội dung nhận xét '
    'dựa trên trải nghiệm lưu trú thực tế của khách hàng. '

    'Nội dung đánh giá được hệ thống kiểm duyệt tự động. '
    'Những đánh giá bình thường có thể được hiển thị, '
    'trong khi nội dung có dấu hiệu vi phạm như xúc phạm, đe dọa, spam '
    'hoặc chứa thông tin riêng tư có thể bị đánh dấu, tạm ẩn '
    'hoặc chuyển cho quản trị viên xem xét tùy theo mức độ. '

    'Khách hàng nên đánh giá dựa trên trải nghiệm thực tế '
    'và tránh đưa thông tin cá nhân nhạy cảm vào nội dung nhận xét.',

    'REVIEW_GUIDE',
    'ACTIVE'
);