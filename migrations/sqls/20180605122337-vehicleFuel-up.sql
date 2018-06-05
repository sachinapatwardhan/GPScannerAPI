/* Replace with your SQL commands */

ALTER TABLE `tblvehicle` 
ADD COLUMN `FuelRatio` DECIMAL(18,2) NULL DEFAULT '1.00' AFTER `DeviceCompany`,
ADD COLUMN `FuelCapacity` DECIMAL(18,2) NULL DEFAULT '0.00' AFTER `FuelRatio`,
ADD COLUMN `IsFule` TINYINT(1) NULL DEFAULT '0' AFTER `FuelCapacity`;
