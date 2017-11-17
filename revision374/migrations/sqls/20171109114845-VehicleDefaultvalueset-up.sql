/* Replace with your SQL commands */


ALTER TABLE `tblvehicle` 
CHANGE COLUMN `Relay` `Relay` INT(11) NULL DEFAULT 0 ,
CHANGE COLUMN `Siren` `Siren` INT(11) NULL DEFAULT 0 ,
CHANGE COLUMN `UserDefined` `UserDefined` INT(11) NULL DEFAULT 0 ,
CHANGE COLUMN `DoorLock` `DoorLock` INT(11) NULL DEFAULT 0 ,
CHANGE COLUMN `DoorUnlock` `DoorUnlock` INT(11) NULL DEFAULT 0 ;

Update tblvehicle set Relay=0,Siren=0,UserDefined=0,DoorLock=0,DoorUnlock=0 where id>0;