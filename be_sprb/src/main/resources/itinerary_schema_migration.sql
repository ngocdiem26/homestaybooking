-- Migration sửa schema tạo lịch trình AI theo cấu trúc mới.
-- Chạy file này nếu backend báo: "Schema lịch trình chưa đúng dữ liệu mới".
-- Lưu ý: phần này xóa dữ liệu lịch trình cũ vì schema cũ không còn tương thích.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS itinerary_items;
DROP TABLE IF EXISTS itineraries;
DROP TABLE IF EXISTS user_itineraries;
SET FOREIGN_KEY_CHECKS = 1;

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
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (itinerary_id),
    UNIQUE KEY uk_itineraries_code (itinerary_code),
    KEY idx_itineraries_user (user_id),
    KEY idx_itineraries_user_status (user_id, itinerary_status, created_at),
    KEY idx_itineraries_destination (province, city),

    CONSTRAINT fk_itineraries_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_itineraries_selected_home
        FOREIGN KEY (selected_home_id) REFERENCES homestays(home_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

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
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    estimated_cost DECIMAL(12,2) NULL,
    transport_note VARCHAR(500) NULL,
    note TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (item_id),
    KEY idx_itinerary_items_itinerary (itinerary_id),
    KEY idx_itinerary_items_timeline (itinerary_id, day_number, display_order, start_time),
    KEY idx_itinerary_items_activity (activity_id),

    CONSTRAINT fk_itinerary_items_itinerary
        FOREIGN KEY (itinerary_id) REFERENCES itineraries(itinerary_id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_itinerary_items_activity
        FOREIGN KEY (activity_id) REFERENCES activities(activity_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
