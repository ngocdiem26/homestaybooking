-- Homestay Booking Database
-- Fixed version: UTF-8, MySQL-compatible, clean foreign key names
-- Charset: utf8mb4
CREATE DATABASE IF NOT EXISTS lvtn
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE lvtn;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS review_replies;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS promotion_usages;
DROP TABLE IF EXISTS booking_services;
DROP TABLE IF EXISTS booking_details;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS search_histories;
DROP TABLE IF EXISTS chat_recommendations;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS homestay_images;
DROP TABLE IF EXISTS homestay_amenities;
DROP TABLE IF EXISTS homestay_availabilities;
DROP TABLE IF EXISTS homestay_services;
DROP TABLE IF EXISTS rules;
DROP TABLE IF EXISTS homestays;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS promotions;

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
    avatar VARCHAR(255),
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
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
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


