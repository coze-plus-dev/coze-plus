-- Add user_id field to corporation_employee table for user account association
ALTER TABLE `opencoze`.`corporation_employee` 
ADD COLUMN `user_id` bigint unsigned NULL COMMENT "Associated User ID (NULL if no user account)" AFTER `mobile`;

-- Add index for user_id to improve query performance
ALTER TABLE `opencoze`.`corporation_employee`
ADD INDEX `idx_user_id` (`user_id`);

-- Add unique constraint to ensure one-to-one relationship between employee and user
ALTER TABLE `opencoze`.`corporation_employee`
ADD UNIQUE INDEX `uk_user_id` (`user_id`);