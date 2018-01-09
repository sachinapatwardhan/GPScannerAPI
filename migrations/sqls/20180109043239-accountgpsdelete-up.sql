/* Replace with your SQL commands */

ALTER TABLE `tblgpsdeletecash` 
ADD COLUMN `RequestType` VARCHAR(45) NULL AFTER `ModifiedDate`;


ALTER TABLE `tblorderservice` 
DROP FOREIGN KEY `FK_tblorderservice_aspnet_Users`;
ALTER TABLE `tblorderservice` 
DROP INDEX `FK_tblorderservice_aspnet_Users_idx` ;


INSERT INTO `tblemailtemplate` (`Type`,`EmailSubject`,`EmailBody`,`EmailFrom`) VALUES ('Account Remove','Account Delete','','pmt@bugzstudio.com');


DELIMITER $$
CREATE PROCEDURE `ManageDeleteData_SP`(IN DeviceId LONGTEXT, IN UserId VARCHAR(100))
BEGIN

INSERT INTO maarkarchives.tblgpsdata (`Datetime`, `Latitude`, `Longitude`, `GPSPositioning`, `Speed`, `Direction`, `Status`, `DeviceId`, `IsRelayToStopTheCar`, `IsSirenSound`, `IsUserDefined`, `IsLockTheDoor`,
 `IsUnlockTheDoor`, `IsSOS`, `IsWiringForAntiTamper`, `IsDoor`, `IsEngine`, `IsOriginalSirenTriggeringStatus`, `CreatedDate`, `HDOP`, `Altitude`, `AD1`, `AD2`, `OdoMeter`, `Date`, `idDeleteCash`)
SELECT `Datetime`, `Latitude`, `Longitude`, `GPSPositioning`, `Speed`, `Direction`, `tblgpsdata`.`Status` AS `Status`, `tblgpsdata`.`DeviceId` AS `DeviceId`, `IsRelayToStopTheCar`, `IsSirenSound`, `IsUserDefined`, `IsLockTheDoor`,
 `IsUnlockTheDoor`, `IsSOS`, `IsWiringForAntiTamper`, `IsDoor`, `IsEngine`, `IsOriginalSirenTriggeringStatus`, `tblgpsdata`.`CreatedDate` AS `CreatedDate`, `HDOP`, `Altitude`, `AD1`, `AD2`, `OdoMeter`, `Date`, 
 (Select Id From `tblgpsdeletecash` Where idUser = UserId AND Status = 'Pending' AND RequestType = 'AccountDelete') AS `IdDeleteCash`
 FROM `tblgpsdata` WHERE FIND_IN_SET(`tblgpsdata`.`DeviceId`, DeviceId);

INSERT INTO maarkarchives.tblalarm (`Latitude`, `Longitude`, `GPSPositioning`, `Speed`, `Direction`, `Status`, `DeviceId`, `AlarmCode`, `CreatedDate`, `Datetime`, `Date`, `FenceName`, `IsRead`, `IdDeleteCash`)
SELECT `Latitude`, `Longitude`, `GPSPositioning`, `Speed`, `Direction`, `tblalarm`.`Status` AS `Status`, `tblalarm`.`DeviceId` AS `DeviceId`,
 `AlarmCode`, `tblalarm`.`CreatedDate` AS `CreatedDate`, `Datetime`, `Date`, `FenceName`, `IsRead`, 
 (Select Id From `tblgpsdeletecash` Where idUser = UserId AND Status = 'Pending' AND RequestType = 'AccountDelete') AS `IdDeleteCash`
 FROM `tblalarm` WHERE FIND_IN_SET(`tblalarm`.`DeviceId`, DeviceId);

INSERT INTO maarkarchives.tblfence (`name`, `deviceId`, `range`, `status`, `lat`, `lng`, `fencedraw`, `IsInFence`, `IsFenceOnline`, `IdAdvanceFence`, `IdDeleteCash`)
SELECT `name`, `tblfence`.`deviceId` AS `deviceId`, `range`, `tblfence`.`status` AS `status`, `lat`, `lng`, `fencedraw`, `IsInFence`, `IsFenceOnline`, `IdAdvanceFence`, 
 (Select Id From `tblgpsdeletecash` Where idUser = UserId AND Status = 'Pending' AND RequestType = 'AccountDelete') AS `IdDeleteCash`
 FROM `tblfence` WHERE FIND_IN_SET(`tblfence`.`DeviceId`, DeviceId);

INSERT INTO maarkarchives.tblvehicle (`iduser`, `Name`, `deviceid`, `renewaldate`, `IsOnline`, `HandshakDatetime`, `CreatedDate`, `MaxSpeed`, `IsACC`, `BatteryPercentage`, `CreatedBy`, `ModifiedDate`, `ModifiedBy`,
 `SleepMode`, `GPRSInterval`, `GPRSStopInterval`, `Arm`, `OdoMeter`, `HeartbeatInterval`, `Relay`, `Siren`, `UserDefined`, `DoorLock`, `DoorUnlock`,  `TimeZone`, `IsDelete`, `DeviceType`, `idSalesAgent`,
 `LastArmSetting`, `IsShared`, `InsurenceDate`, `PUCDate`, `idType`, `Movement`, `ACC`, `IdDeleteCash`)
 SELECT `tblvehicle`.`iduser`, `Name`, `tblvehicle`.`deviceid` AS `deviceid`, `renewaldate`, `IsOnline`, `HandshakDatetime`, `tblvehicle`.`CreatedDate` AS `CreatedDate`, `MaxSpeed`, `IsACC`, `BatteryPercentage`, `tblvehicle`.`CreatedBy`, `tblvehicle`.`ModifiedDate`, `tblvehicle`.`ModifiedBy`,
 `SleepMode`, `GPRSInterval`, `GPRSStopInterval`, `Arm`, `OdoMeter`, `HeartbeatInterval`, `Relay`, `Siren`, `UserDefined`, `DoorLock`, `DoorUnlock`,  `TimeZone`, `IsDelete`, `DeviceType`, `idSalesAgent`,
 `LastArmSetting`, `IsShared`, `InsurenceDate`, `PUCDate`, `idType`, `Movement`, `ACC`, 
 (Select Id From `tblgpsdeletecash` Where idUser = UserId AND Status = 'Pending' AND RequestType = 'AccountDelete') AS `IdDeleteCash`
 FROM `tblvehicle` WHERE FIND_IN_SET(`tblvehicle`.`deviceid`, DeviceId);

INSERT INTO maarkarchives.tbluserinformation (`email`, `username`, `password`, `ProfileName`, `phone`, `country`, `gender`, `image`, `tbluserinformation`.`createdby`, `tbluserinformation`.`createddate`, `tbluserinformation`.`modifiedby`, `tbluserinformation`.`modifieddate`,
 `OTP`, `IsMobileVerify`, `Type`, `idApp`, `Notification`, `LastLogin`, `IdDeleteCash`)
 SELECT `email`, `username`, `password`, `ProfileName`, `phone`, `country`, `gender`, `image`, `tbluserinformation`.`createdby`, `tbluserinformation`.`createddate`, `tbluserinformation`.`modifiedby`, `tbluserinformation`.`modifieddate`,
 `OTP`, `IsMobileVerify`, `Type`, `idApp`, `Notification`, `LastLogin`, 
 (Select Id From `tblgpsdeletecash` Where idUser = UserId AND Status = 'Pending' AND RequestType = 'AccountDelete') AS `IdDeleteCash`
 FROM `tbluserinformation` WHERE `tbluserinformation`.`id` = UserId;

END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `ManageDeleteGPSData_SP`(IN DeviceId VARCHAR(100))
BEGIN

INSERT INTO maarkarchives.tblgpsdata (`Datetime`, `Latitude`, `Longitude`, `GPSPositioning`, `Speed`, `Direction`, `Status`, `DeviceId`, `IsRelayToStopTheCar`, `IsSirenSound`, `IsUserDefined`, `IsLockTheDoor`,
 `IsUnlockTheDoor`, `IsSOS`, `IsWiringForAntiTamper`, `IsDoor`, `IsEngine`, `IsOriginalSirenTriggeringStatus`, `CreatedDate`, `HDOP`, `Altitude`, `AD1`, `AD2`, `OdoMeter`, `Date`, `idDeleteCash`)
SELECT `Datetime`, `Latitude`, `Longitude`, `GPSPositioning`, `Speed`, `Direction`, `tblgpsdata`.`Status` AS `Status`, `tblgpsdata`.`DeviceId` AS `DeviceId`, `IsRelayToStopTheCar`, `IsSirenSound`, `IsUserDefined`, `IsLockTheDoor`,
 `IsUnlockTheDoor`, `IsSOS`, `IsWiringForAntiTamper`, `IsDoor`, `IsEngine`, `IsOriginalSirenTriggeringStatus`, `tblgpsdata`.`CreatedDate` AS `CreatedDate`, `HDOP`, `Altitude`, `AD1`, `AD2`, `OdoMeter`, `Date`, `tblgpsdeletecash`.`Id` AS `IdDeleteCash`
FROM `tblgpsdata` INNER JOIN `tblgpsdeletecash` ON `tblgpsdeletecash`.`DeviceId` = `tblgpsdata`.`DeviceId` WHERE `tblgpsdata`.`DeviceId` = DeviceId;

END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `ManageDeleteQRY_SP`(IN DeviceId VARCHAR(100),IN DBName VARCHAR(100))
BEGIN
SET @s = CONCAT('INSERT INTO `', DBName ,'`.`tblfence` (`name`, `deviceId`, `range`, `status`, `lat`, `lng`, `fencedraw`, `IsInFence`, `IsFenceOnline`, `IdAdvanceFence`, `IdDeleteCash`)
			SELECT `name`, `tblfence`.`deviceId` AS `deviceId`, `range`, `tblfence`.`status` AS `status`, `lat`, `lng`, `fencedraw`, `IsInFence`, `IsFenceOnline`, `IdAdvanceFence`, `tblgpsdeletecash`.`Id` AS `IdDeleteCash`
			FROM `tblfence` INNER JOIN `tblgpsdeletecash` ON `tblgpsdeletecash`.`DeviceId` = `tblfence`.`DeviceId` WHERE `tblfence`.`DeviceId` = ', DeviceId);
	PREPARE stmt FROM @s;
	EXECUTE stmt;

DEALLOCATE prepare stmt;

END$$
DELIMITER ;

