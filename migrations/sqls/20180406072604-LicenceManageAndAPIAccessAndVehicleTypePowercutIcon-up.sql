/* Replace with your SQL commands */

CREATE TABLE `tblapiaccessclient` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  `Phone` varchar(45) NOT NULL,
  `Email` varchar(45) NOT NULL,
  `AppName` varchar(45) NOT NULL,
  `Token` varchar(45) NOT NULL,
  `Key` varchar(45) NOT NULL,
  `IsActive` tinyint(1) DEFAULT '0',
  `CreatedDate` datetime NOT NULL,
  `CreatedBy` varchar(45) NOT NULL,
  `ModifiedDate` datetime DEFAULT NULL,
  `ModifiedBy` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `tblauditloglicence` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Type` varchar(200) DEFAULT NULL,
  `LicenceNo` varchar(100) DEFAULT NULL,
  `DeviceId` varchar(100) DEFAULT NULL,
  `ExpiryDate` datetime DEFAULT NULL,
  `OldExpiryDate` datetime DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `CreatedBy` varchar(100) DEFAULT NULL,
  `Message` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `tblvehicletype` 
ADD COLUMN `PowerCuttIcon` VARCHAR(100) NULL DEFAULT NULL AFTER `ActiveIcon`,
ADD COLUMN `LocatePowerCuttIcon` VARCHAR(100) NULL DEFAULT NULL AFTER `LocateActiveIcon`;

ALTER TABLE `tblappinfo` 
ADD COLUMN `LicenceRenewalType` VARCHAR(100) NULL DEFAULT NULL AFTER `WebAppHeaderLogo`,
ADD COLUMN `LicenceType` VARCHAR(100) NULL DEFAULT NULL AFTER `LicenceRenewalType`;


CREATE TABLE `tbllicencemanager` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdUser` int(11) DEFAULT NULL,
  `LicenceNo` varchar(200) DEFAULT NULL,
  `DeviceId` varchar(200) DEFAULT NULL,
  `ExpiryDate` datetime DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `ModifiedDate` datetime DEFAULT NULL,
  `IsDeleted` tinyint(1) DEFAULT '0',
  `idApp` int(11) DEFAULT NULL,
  `LicenceRenewalType` varchar(100) DEFAULT NULL,
  `LicenceType` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


