/* Replace with your SQL commands */

ALTER TABLE `tbldevicerenewprice` 
ADD COLUMN `LicenceRenewalType` VARCHAR(100) NULL DEFAULT NULL AFTER `CreatedDate`,
ADD COLUMN `LicenceType` VARCHAR(100) NULL DEFAULT NULL AFTER `LicenceRenewalType`;