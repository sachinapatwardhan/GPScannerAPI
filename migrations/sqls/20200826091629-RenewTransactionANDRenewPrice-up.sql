/* Replace with your SQL commands */

CREATE TABLE `tblrenewtransaction` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `idOrder` INT NULL,
  `idUser` INT NULL,
  `idApp` INT NULL,
  `Amount` DECIMAL(16,2) NULL,
  `CreatedBy` VARCHAR(200) NULL,
  `CreatedDate` DATETIME NULL,
  `IsComplete` TINYINT NULL DEFAULT 0,
  `CompletedDate` DATETIME NULL,
  `Remark` TEXT NULL,
  `CompletedBy` VARCHAR(200) NULL,
  PRIMARY KEY (`id`));

  INSERT INTO `tblorderservicestatus` (`OrderStatus`) VALUES ('Cancel');
  INSERT INTO `tblorderservicestatus` (`OrderStatus`) VALUES ('Not Paid');
  INSERT INTO `tblorderservicestatus` (`OrderStatus`) VALUES ('Payment Fail');