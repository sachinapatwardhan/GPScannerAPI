/* Replace with your SQL commands */

ALTER TABLE `tbluserinformation` 
ADD COLUMN `AppVersion` VARCHAR(45) NULL DEFAULT NULL AFTER `LastLogin`,
ADD COLUMN `Platform` VARCHAR(50) NULL DEFAULT NULL AFTER `AppVersion`;