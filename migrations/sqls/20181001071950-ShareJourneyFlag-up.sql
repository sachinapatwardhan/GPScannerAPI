/* Replace with your SQL commands */

ALTER TABLE `tblsharedemail` 
ADD COLUMN `JourneyFlag` TINYINT(1) NULL DEFAULT '0' AFTER `Status`;

ALTER TABLE `tblsharedevice` 
ADD COLUMN `JourneyFlag` TINYINT(1) NULL DEFAULT '0' AFTER `IdSharedGroup`;

