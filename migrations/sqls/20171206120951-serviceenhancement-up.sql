/* Replace with your SQL commands */

CREATE TABLE `tblserviceenhancement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idvehicle` int(11) NOT NULL,
  `idUser` int(11) NOT NULL,
  `DeviceId` varchar(100) NOT NULL,
  `Type` varchar(45) DEFAULT NULL,
  `Fromdate` datetime DEFAULT NULL,
  `Todate` datetime DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '0',
  `CreatedBy` varchar(45) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `ModifiedBy` varchar(45) DEFAULT NULL,
  `ModifiedDate` datetime DEFAULT NULL,
  `Title` varchar(45) DEFAULT NULL,
  `Description` varchar(45) DEFAULT NULL,
  `Currentkm` varchar(45) DEFAULT NULL,
  `Expiredkm` varchar(45) DEFAULT NULL,
  `IsDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `tblserviceenhancementnotification` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdServiceEnhancement` int(11) DEFAULT NULL,
  `idvehicle` int(11) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `Message` varchar(200) DEFAULT NULL,
  `days` int(11) DEFAULT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tblserviceenhancementtype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Type` varchar(45) DEFAULT NULL,
  `CreatedBy` varchar(45) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `ModifiedBy` varchar(45) DEFAULT NULL,
  `ModifiedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

