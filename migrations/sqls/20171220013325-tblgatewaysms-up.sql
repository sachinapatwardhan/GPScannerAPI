/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS `tblgatewaysms` (
	`unixTime` bigint(20) unsigned NOT NULL,
	`message` varchar(100) DEFAULT NULL,
	`mtmo` varchar(20) DEFAULT NULL,
	`deviceId` varchar(100) DEFAULT NULL,
	`gatewayUuid` varchar(45) DEFAULT NULL,
	`devicePhone` varchar(45) DEFAULT NULL,
	PRIMARY KEY (`unixTime`),
	KEY `DEVICE_ID` (`deviceId`),
	KEY `GATEWAY_UUID` (`gatewayUuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;