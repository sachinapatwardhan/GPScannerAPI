ALTER TABLE
  `tbltrackerreport`
ADD
  COLUMN `processingStatus` VARCHAR(50) NULL
AFTER
  `id`,
ADD
  COLUMN `idleSecs` INT NULL
AFTER
  `totalSecs`;
