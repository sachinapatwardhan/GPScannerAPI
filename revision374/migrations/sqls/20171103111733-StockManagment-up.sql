/* Replace with your SQL commands */

CREATE TABLE `tbltype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text,
  `displayorder` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `tblstockentry` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idtype` int(11) NOT NULL,
  `entryvalue` text,
  `createddate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tblstockentry_tbltype_idx` (`idtype`),
  CONSTRAINT `fk_tblstockentry_tbltype` FOREIGN KEY (`idtype`) REFERENCES `tbltype` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO `tbltype` (`name`,`displayorder`) VALUES ('MT05',1);
INSERT INTO `tbltype` (`name`,`displayorder`) VALUES ('TK208',2);
INSERT INTO `tbltype` (`name`,`displayorder`) VALUES ('TK228',3);
INSERT INTO `tbltype` (`name`,`displayorder`) VALUES ('GT08',4);
INSERT INTO `tbltype` (`name`,`displayorder`) VALUES ('TK510',5);

