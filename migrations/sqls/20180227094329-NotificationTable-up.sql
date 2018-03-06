/* Replace with your SQL commands */

CREATE TABLE `tblnotificationmgmt` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Notification` varchar(100) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `AlarmCode` char(2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `tblnotificationsetting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idNotification` int(11) DEFAULT NULL,
  `idUser` int(11) DEFAULT NULL,
  `IsNotificationOn` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `tbluserinformation` 
CHANGE COLUMN `Notification` `Notification` TINYINT(1) NULL DEFAULT '1' ;

Update tbluserinformation set Notification=true;


ALTER TABLE `tbljourneyroute` 
ADD COLUMN `JourneyName` VARCHAR(100) NULL DEFAULT NULL AFTER `IsCompleted`,
ADD COLUMN `IsDelete` TINYINT(1) NULL DEFAULT '0' AFTER `JourneyName`,
ADD COLUMN `StartAddress` VARCHAR(200) NULL DEFAULT NULL AFTER `IsDelete`,
ADD COLUMN `EndAddress` VARCHAR(200) NULL DEFAULT NULL AFTER `StartAddress`,
ADD COLUMN `TotalKm` DECIMAL(18,2) NULL DEFAULT NULL AFTER `EndAddress`;



INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('1', 'Low Bettry alert', '0', '10');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('2', 'Movement alert', '0', '12');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('3', 'External Power Cut alert', '1', '50');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('4', 'Original Triggering alert', '0', '05');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('5', 'Line Broken alert', '0', '02');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('6', 'Veer Report alert', '0', '52');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('7', 'Fuel Driving alert', '0', '60');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('8', 'Crash alert', '0', '71');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('9', 'Engine On Alert', '1', '04');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('11', 'Fence In Alert', '1', '6');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('12', 'Fence Out Alert', '1', '66');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('13', 'Vibration Alert', '1', '30');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('14', 'Door Open Alert', '0', '03');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('16', 'Max Speed Alert', '1', '11');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('17', 'Acceleration alert', '0', '72');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`, `AlarmCode`) VALUES ('18', 'Fuel Loss alert', '0', '81');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`) VALUES ('19', 'Car Service', '1');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`) VALUES ('20', 'Tyre Replacement', '1');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`) VALUES ('21', 'Insurance Renewal', '1');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`) VALUES ('22', 'Driving Licence Renewal', '1');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`) VALUES ('23', 'Battery Replacement', '1');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`) VALUES ('24', 'PUC Renewal', '1');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`) VALUES ('25', 'Road Tax Renewal', '1');
INSERT INTO `tblnotificationmgmt` (`id`, `Notification`, `IsActive`) VALUES ('26', 'Expire Device', '1');

CREATE TABLE `tbldeviceaccvalueset` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DeviceId` varchar(100) DEFAULT NULL,
  `IsACCValueSet` tinyint(1) DEFAULT '0',
  `TotalFailerCount` int(11) DEFAULT '0',
  `CreatedDate` datetime DEFAULT NULL,
  `ACCValueSetTime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

