/* Replace with your SQL commands */


ALTER TABLE `tblfence` 
ADD COLUMN `IdAdvanceFence` INT(11) NULL;

CREATE TABLE `tbladvancefence` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  `CreatedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
