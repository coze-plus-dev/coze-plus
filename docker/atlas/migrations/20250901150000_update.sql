
ALTER TABLE `opencoze`.`user_role`
DROP INDEX `uniq_user_role_space`;


ALTER TABLE `opencoze`.`user_role`
DROP INDEX `idx_space_id`;


ALTER TABLE `opencoze`.`user_role`
DROP INDEX `idx_is_disabled`;


ALTER TABLE `opencoze`.`user_role`
DROP COLUMN `space_id`;

ALTER TABLE `opencoze`.`user_role`
DROP COLUMN `is_disabled`;

ALTER TABLE `opencoze`.`user_role`
ADD UNIQUE INDEX `uniq_user_role_active` (`user_id`, `role_id`, `deleted_at`);

