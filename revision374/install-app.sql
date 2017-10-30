USE `gpsscanner`;

CREATE TABLE IF NOT EXISTS `tblagentretailer` (
	`agentId` int(11) NOT NULL,
	`retailerId` int(11) NOT NULL,
	`createdDatetime` datetime DEFAULT NULL,
	`lastModifiedDatetime` datetime DEFAULT NULL,
	PRIMARY KEY (`agentId`,`retailerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='To store relationship.';

CREATE TABLE IF NOT EXISTS `tbldeviceagentretailer` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`agentId` int(11) DEFAULT NULL,
	`retailerId` int(11) DEFAULT NULL,
	`deviceId` int(11) DEFAULT NULL,
	`activatedDatetime` datetime DEFAULT NULL,
	`createdDatetime` datetime DEFAULT NULL,
	`lastModifiedDatetime` datetime DEFAULT NULL,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='To store which device activated when.';