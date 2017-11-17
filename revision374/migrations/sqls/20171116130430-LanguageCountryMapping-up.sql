/* Replace with your SQL commands */

CREATE TABLE `tbllanguageincountry` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdLanguage` int(11) DEFAULT NULL,
  `Country` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;