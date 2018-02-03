/* Replace with your SQL commands */
CREATE TABLE `tblfeedback` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdUser` int(11) DEFAULT NULL,
  `AppsUserFriendly` int(11) DEFAULT NULL,
  `GPSAccuracy` int(11) DEFAULT NULL,
  `TrackLocLiverate` int(11) DEFAULT NULL,
  `TrackLocHistory` int(11) DEFAULT NULL,
  `Notificaton` int(11) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `CreatedBy` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `tblvehiclegroup` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `GroupName` varchar(200) DEFAULT NULL,
  `IdUser` int(11) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `CreatedBy` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `tblsharedevice` 
ADD COLUMN `IdSharedGroup` INT(11) NULL DEFAULT NULL AFTER `IsNotification`;


ALTER TABLE `tblvehicle` 
ADD COLUMN `IdGroup` INT(11) NULL DEFAULT NULL AFTER `ShareCode`;
