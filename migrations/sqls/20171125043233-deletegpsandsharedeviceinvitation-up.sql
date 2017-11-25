/* Replace with your SQL commands */

CREATE TABLE `tblgpsdeletecash` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `idVehicle` int(11) DEFAULT NULL,
  `DeviceId` varchar(100) DEFAULT NULL,
  `idUser` int(11) DEFAULT NULL,
  `Status` varchar(45) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  `CreatedBy` varchar(100) DEFAULT NULL,
  `ModifiedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `tblsharedemail` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `DeviceId` varchar(100) DEFAULT NULL,
  `idUser` int(11) DEFAULT NULL,
  `SharedEmail` varchar(200) DEFAULT NULL,
  `Status` varchar(45) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE tblpushnotification
Add AppVersion VARCHAR(45) DEFAULT NULL;


ALTER TABLE tbluserinformation
Add Notification TINYINT(1) DEFAULT '0';


ALTER TABLE tbluserinformation
Add LastLogin DATETIME DEFAULT NULL;

ALTER TABLE tblvehicletype
Add LocateOnIcon varchar(100) DEFAULT NULL;

ALTER TABLE tblvehicletype
Add LocateOffIcon varchar(100) DEFAULT NULL;

ALTER TABLE tblvehicletype
Add LocateActiveIcon varchar(100) DEFAULT NULL;

ALTER TABLE tblvehicletype
Add LocateIsRotate TINYINT(1) DEFAULT '1';

ALTER TABLE tbliosimeinumbermapping
Add Type varchar(45) DEFAULT NULL;

Truncate table tblimeinumber;
Truncate table tbliosimeinumbermapping;