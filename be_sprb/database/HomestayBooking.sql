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
    JOIN booking_details bd ON bd.booking_id = b.booking_id
    WHERE UPPER(b.booking_status) = 'COMPLETED'
      AND bd.checkout_date >= DATE_SUB(CURRENT_DATE, INTERVAL 2 YEAR)
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
    JOIN booking_details bd ON bd.booking_id = b.booking_id
    WHERE UPPER(b.booking_status) = 'COMPLETED'
      AND bd.checkout_date >= DATE_SUB(CURRENT_DATE, INTERVAL 2 YEAR)
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

ALTER TABLE users MODIFY avatar LONGTEXT;

ALTER TABLE reviews
ADD COLUMN moderation_status VARCHAR(30) NULL,
ADD COLUMN moderation_action VARCHAR(30) NULL,
ADD COLUMN moderation_reason TEXT NULL,

ADD COLUMN toxicity_score DECIMAL(5,4) NULL,
ADD COLUMN profanity_score DECIMAL(5,4) NULL,
ADD COLUMN insult_score DECIMAL(5,4) NULL,
ADD COLUMN threat_score DECIMAL(5,4) NULL,
ADD COLUMN hate_score DECIMAL(5,4) NULL,
ADD COLUMN death_related_score DECIMAL(5,4) NULL,
ADD COLUMN spam_score DECIMAL(5,4) NULL,
ADD COLUMN privacy_score DECIMAL(5,4) NULL,

ADD COLUMN sentiment VARCHAR(30) NULL,
ADD COLUMN rating_comment_mismatch BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN moderation_categories JSON NULL,
ADD COLUMN moderated_at TIMESTAMP NULL;

ALTER TABLE reviews
ADD COLUMN admin_review_status VARCHAR(30) NOT NULL DEFAULT 'NONE'
AFTER review_status,
ADD COLUMN moderated_by INT NULL AFTER moderated_at,
ADD COLUMN hidden_reason TEXT NULL AFTER moderated_by;

CREATE TABLE IF NOT EXISTS review_moderation_logs (
    log_id BIGINT NOT NULL AUTO_INCREMENT,
    review_id INT NOT NULL,

    provider VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NULL,

    moderation_action VARCHAR(30) NOT NULL,
    admin_review_status VARCHAR(30) NULL,
    moderation_reason TEXT NULL,

    toxicity_score DECIMAL(5,4) NULL,
    profanity_score DECIMAL(5,4) NULL,
    insult_score DECIMAL(5,4) NULL,
    threat_score DECIMAL(5,4) NULL,
    hate_score DECIMAL(5,4) NULL,
    death_related_score DECIMAL(5,4) NULL,
    spam_score DECIMAL(5,4) NULL,
    privacy_score DECIMAL(5,4) NULL,
    final_score DECIMAL(5,4) NULL,

    sentiment VARCHAR(30) NULL,
    rating_comment_mismatch BOOLEAN NOT NULL DEFAULT FALSE,
    raw_response LONGTEXT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (log_id),

    KEY idx_review_moderation_logs_review_id (review_id),

    CONSTRAINT fk_review_moderation_logs_review
        FOREIGN KEY (review_id) REFERENCES reviews(review_id)
        ON DELETE CASCADE
);

ALTER TABLE reviews
  MODIFY moderation_reason TEXT NULL,
  MODIFY hidden_reason TEXT NULL;

ALTER TABLE review_moderation_logs
  MODIFY moderation_reason TEXT NULL,
  MODIFY raw_response LONGTEXT NULL;

ALTER TABLE review_moderation_logs
  MODIFY moderation_reason TEXT NULL,
  MODIFY raw_response LONGTEXT NULL;
  
ALTER TABLE review_moderation_logs

CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE reviews

CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;