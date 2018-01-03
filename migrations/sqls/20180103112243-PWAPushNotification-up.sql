/* Replace with your SQL commands */

CREATE TABLE `tblpwa_notification_subscription` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `endpoint` text,
  `auth` text,
  `p256dh` text,
  `iduser` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tblpwa_tbluserinfo_idx` (`iduser`),
  CONSTRAINT `fk_tblpwa_tbluserinfo` FOREIGN KEY (`iduser`) REFERENCES `tbluserinformation` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO `tblorderservicestatus` (`OrderStatus`) VALUES ('Void');
INSERT INTO `tblorderservicestatus` (`OrderStatus`) VALUES ('Expire');
