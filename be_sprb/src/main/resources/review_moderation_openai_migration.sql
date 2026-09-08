-- Review moderation migration for Cozygo.
-- Run this once in MySQL Workbench if your database was created before the OpenAI moderation update.
-- It keeps existing data and only adds/modifies moderation fields needed by the backend.

USE lvtn;

DELIMITER $$

DROP PROCEDURE IF EXISTS add_column_if_missing $$
CREATE PROCEDURE add_column_if_missing(
    IN tableName VARCHAR(64),
    IN columnName VARCHAR(64),
    IN columnDefinition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = tableName
          AND COLUMN_NAME = columnName
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tableName, '` ADD COLUMN `', columnName, '` ', columnDefinition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$

DELIMITER ;

CALL add_column_if_missing('reviews', 'review_status', "VARCHAR(30) NOT NULL DEFAULT 'VISIBLE'");
CALL add_column_if_missing('reviews', 'admin_review_status', "VARCHAR(30) NOT NULL DEFAULT 'NONE'");
CALL add_column_if_missing('reviews', 'moderation_status', 'VARCHAR(60) NULL');
CALL add_column_if_missing('reviews', 'moderation_action', 'VARCHAR(60) NULL');
CALL add_column_if_missing('reviews', 'moderation_reason', 'TEXT NULL');
CALL add_column_if_missing('reviews', 'hidden_reason', 'TEXT NULL');
CALL add_column_if_missing('reviews', 'toxicity_score', 'DECIMAL(8,4) NULL');
CALL add_column_if_missing('reviews', 'profanity_score', 'DECIMAL(8,4) NULL');
CALL add_column_if_missing('reviews', 'insult_score', 'DECIMAL(8,4) NULL');
CALL add_column_if_missing('reviews', 'threat_score', 'DECIMAL(8,4) NULL');
CALL add_column_if_missing('reviews', 'hate_score', 'DECIMAL(8,4) NULL');
CALL add_column_if_missing('reviews', 'death_related_score', 'DECIMAL(8,4) NULL');
CALL add_column_if_missing('reviews', 'spam_score', 'DECIMAL(8,4) NULL');
CALL add_column_if_missing('reviews', 'privacy_score', 'DECIMAL(8,4) NULL');
CALL add_column_if_missing('reviews', 'final_score', 'DECIMAL(8,4) NULL');
CALL add_column_if_missing('reviews', 'sentiment', 'VARCHAR(30) NULL');
CALL add_column_if_missing('reviews', 'rating_comment_mismatch', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL add_column_if_missing('reviews', 'moderation_categories', 'JSON NULL');
CALL add_column_if_missing('reviews', 'moderated_at', 'DATETIME NULL');

ALTER TABLE reviews
    MODIFY COLUMN moderation_reason TEXT NULL,
    MODIFY COLUMN hidden_reason TEXT NULL,
    MODIFY COLUMN moderation_categories JSON NULL;

CREATE TABLE IF NOT EXISTS review_moderation_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    review_id BIGINT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NULL,
    raw_response LONGTEXT NULL,
    moderation_status VARCHAR(60) NULL,
    moderation_action VARCHAR(60) NULL,
    moderation_reason TEXT NULL,
    toxicity_score DECIMAL(8,4) NULL,
    profanity_score DECIMAL(8,4) NULL,
    insult_score DECIMAL(8,4) NULL,
    threat_score DECIMAL(8,4) NULL,
    hate_score DECIMAL(8,4) NULL,
    death_related_score DECIMAL(8,4) NULL,
    spam_score DECIMAL(8,4) NULL,
    privacy_score DECIMAL(8,4) NULL,
    final_score DECIMAL(8,4) NULL,
    categories JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_moderation_logs_review
        FOREIGN KEY (review_id) REFERENCES reviews(review_id)
        ON DELETE CASCADE
);

ALTER TABLE review_moderation_logs
    MODIFY COLUMN raw_response LONGTEXT NULL,
    MODIFY COLUMN moderation_reason TEXT NULL,
    MODIFY COLUMN categories JSON NULL;

DROP PROCEDURE IF EXISTS add_column_if_missing;