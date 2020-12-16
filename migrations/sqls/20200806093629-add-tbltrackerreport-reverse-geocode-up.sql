ALTER TABLE
  `tbltrackerreport`
ADD
  COLUMN `mapType` VARCHAR(50) DEFAULT 'Pending'
AFTER
  `endLocation`;
