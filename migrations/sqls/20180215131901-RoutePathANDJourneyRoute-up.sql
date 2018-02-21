/* Replace with your SQL commands */

CREATE TABLE `tblroute` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(200) DEFAULT NULL,
  `UserId` int(11) DEFAULT NULL,
  `Lat` text,
  `Lng` text,
  `Distance` varchar(45) DEFAULT NULL,
  `Duration` varchar(45) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `IsInRoute` tinyint(1) DEFAULT '1',
  `IsRouteOnline` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tblroutemarker` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `MarkerName` varchar(100) DEFAULT NULL,
  `Lat` varchar(100) DEFAULT NULL,
  `Lng` varchar(100) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `IdRoute` int(11) DEFAULT NULL,
  `IsInRouteMarker` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `tblroutedevice` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `DeviceId` varchar(45) DEFAULT NULL,
  `IdRoute` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE `tbljourneyroute` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `DeviceId` varchar(200) DEFAULT NULL,
  `UserId` int(11) DEFAULT NULL,
  `StartTime` datetime DEFAULT NULL,
  `EndTime` datetime DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `CreatedBy` varchar(200) DEFAULT NULL,
  `ModifieDate` datetime DEFAULT NULL,
  `ModifiedBy` varchar(200) DEFAULT NULL,
  `IsCompleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `tbljourneygpsdata` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Datetime` datetime NOT NULL,
  `Latitude` varchar(20) NOT NULL,
  `Longitude` varchar(20) NOT NULL,
  `GPSPositioning` char(1) NOT NULL,
  `Speed` varchar(8) NOT NULL,
  `Direction` varchar(6) NOT NULL,
  `Status` varchar(8) NOT NULL,
  `DeviceId` varchar(100) NOT NULL,
  `IsRelayToStopTheCar` tinyint(1) DEFAULT NULL,
  `IsSirenSound` tinyint(1) DEFAULT NULL,
  `IsUserDefined` tinyint(1) DEFAULT NULL,
  `IsLockTheDoor` tinyint(1) DEFAULT NULL,
  `IsUnlockTheDoor` tinyint(1) DEFAULT NULL,
  `IsSOS` tinyint(1) DEFAULT NULL,
  `IsWiringForAntiTamper` tinyint(1) DEFAULT NULL,
  `IsDoor` tinyint(1) DEFAULT NULL,
  `IsEngine` tinyint(1) DEFAULT NULL,
  `IsOriginalSirenTriggeringStatus` tinyint(1) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `HDOP` int(11) DEFAULT NULL,
  `Altitude` int(11) DEFAULT NULL,
  `AD1` varchar(10) DEFAULT NULL,
  `AD2` varchar(10) DEFAULT NULL,
  `OdoMeter` int(11) DEFAULT NULL,
  `Date` bigint(30) DEFAULT NULL,
  `IsPatchEngine` tinyint(1) DEFAULT '0',
  `IdJourneyRoute` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `tblemailsettingsys` 
ADD COLUMN `IdApp` INT(11) NULL DEFAULT NULL AFTER `EEValidateEmailAddresses`;

ALTER TABLE `tblemailsettingsys` 
DROP COLUMN `EEValidateEmailAddresses`,
DROP COLUMN `EEDefaultFrom`,
DROP COLUMN `EEMandrillKey`,
DROP COLUMN `NotificationEmailTo`,
ADD COLUMN `SMTPService` VARCHAR(150) NULL DEFAULT NULL AFTER `DefaultEmailFrom`,
ADD COLUMN `SMTPhost` VARCHAR(150) NULL DEFAULT NULL AFTER `SMTPService`,
ADD COLUMN `SMTPuser` VARCHAR(150) NULL DEFAULT NULL AFTER `SMTPhost`,
ADD COLUMN `SMTPpass` VARCHAR(100) NULL DEFAULT NULL AFTER `SMTPuser`;

