/* Replace with your SQL commands */

CREATE TABLE `gpsscanner`.`tblusertoken` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `iduser` INT NULL,
  `token` VARCHAR(250) NULL,
  `createddate` DATETIME NULL,
  PRIMARY KEY (`id`));