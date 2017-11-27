/* Replace with your SQL commands */

ALTER TABLE tbliosimeinumbermapping
Add IMEI BIGINT(16) DEFAULT NULL;

ALTER TABLE tbldeviceagentretailer
Add simSerial VARCHAR(45) DEFAULT NULL;