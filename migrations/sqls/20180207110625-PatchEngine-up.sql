/* Replace with your SQL commands */

ALTER TABLE `tblgpsdata` 
ADD COLUMN `IsPatchEngine` TINYINT(1) NULL DEFAULT '0' AFTER `Date`;

