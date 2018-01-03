/* Replace with your SQL commands */


CREATE TABLE `product` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductTypeId` int(11) NOT NULL,
  `ParentGroupedProductId` int(11) NOT NULL,
  `VisibleIndividually` tinyint(1) NOT NULL,
  `Name` varchar(400) NOT NULL,
  `ShortDescription` longtext,
  `FullDescription` longtext,
  `AdminComment` longtext,
  `ProductTemplateId` int(11) NOT NULL,
  `VendorId` int(11) DEFAULT NULL,
  `ShowOnHomePage` tinyint(1) NOT NULL,
  `MetaKeywords` varchar(400) DEFAULT NULL,
  `MetaDescription` longtext,
  `MetaTitle` varchar(400) DEFAULT NULL,
  `AllowCustomerReviews` tinyint(1) NOT NULL,
  `ApprovedRatingSum` int(11) NOT NULL DEFAULT '0',
  `NotApprovedRatingSum` int(11) NOT NULL DEFAULT '0',
  `ApprovedTotalReviews` int(11) NOT NULL DEFAULT '0',
  `NotApprovedTotalReviews` int(11) NOT NULL DEFAULT '0',
  `SubjectToAcl` tinyint(1) NOT NULL,
  `LimitedToStores` tinyint(1) NOT NULL,
  `Sku` varchar(400) DEFAULT NULL,
  `ManufacturerPartNumber` varchar(400) DEFAULT NULL,
  `Gtin` varchar(400) DEFAULT NULL,
  `IsGiftCard` tinyint(1) NOT NULL,
  `GiftCardTypeId` int(11) NOT NULL,
  `RequireOtherProducts` tinyint(1) NOT NULL,
  `RequiredProductIds` varchar(1000) DEFAULT NULL,
  `AutomaticallyAddRequiredProducts` tinyint(1) NOT NULL,
  `IsDownload` tinyint(1) NOT NULL,
  `DownloadId` int(11) NOT NULL DEFAULT '0',
  `UnlimitedDownloads` tinyint(1) NOT NULL DEFAULT '0',
  `MaxNumberOfDownloads` int(11) NOT NULL DEFAULT '0',
  `DownloadExpirationDays` int(11) DEFAULT NULL,
  `DownloadActivationTypeId` int(11) NOT NULL DEFAULT '0',
  `HasSampleDownload` tinyint(1) NOT NULL DEFAULT '0',
  `SampleDownloadId` int(11) NOT NULL DEFAULT '0',
  `HasUserAgreement` tinyint(1) NOT NULL DEFAULT '0',
  `UserAgreementText` longtext,
  `IsRecurring` tinyint(1) NOT NULL,
  `RecurringCycleLength` int(11) NOT NULL,
  `RecurringCyclePeriodId` int(11) NOT NULL,
  `RecurringTotalCycles` int(11) NOT NULL,
  `IsRental` tinyint(1) NOT NULL,
  `RentalPriceLength` int(11) NOT NULL,
  `RentalPricePeriodId` int(11) NOT NULL,
  `IsShipEnabled` tinyint(1) NOT NULL,
  `IsFreeShipping` tinyint(1) NOT NULL,
  `ShipSeparately` tinyint(1) NOT NULL,
  `AdditionalShippingCharge` decimal(18,4) NOT NULL,
  `DeliveryDateId` int(11) NOT NULL,
  `IsTaxExempt` tinyint(1) NOT NULL,
  `TaxCategoryId` int(11) NOT NULL,
  `IsTelecommunicationsOrBroadcastingOrElectronicServices` tinyint(1) NOT NULL,
  `ManageInventoryMethodId` int(11) NOT NULL,
  `UseMultipleWarehouses` tinyint(1) NOT NULL,
  `WarehouseId` int(11) NOT NULL,
  `StockQuantity` int(11) NOT NULL,
  `DisplayStockAvailability` tinyint(1) NOT NULL,
  `DisplayStockQuantity` tinyint(1) NOT NULL,
  `MinStockQuantity` int(11) NOT NULL,
  `LowStockActivityId` int(11) NOT NULL,
  `NotifyAdminForQuantityBelow` int(11) NOT NULL,
  `BackorderModeId` int(11) NOT NULL,
  `AllowBackInStockSubscriptions` tinyint(1) NOT NULL,
  `OrderMinimumQuantity` int(11) NOT NULL,
  `OrderMaximumQuantity` int(11) NOT NULL,
  `AllowedQuantities` varchar(1000) DEFAULT NULL,
  `AllowAddingOnlyExistingAttributeCombinations` tinyint(1) NOT NULL,
  `DisableBuyButton` tinyint(1) NOT NULL,
  `DisableWishlistButton` tinyint(1) NOT NULL,
  `AvailableForPreOrder` tinyint(1) NOT NULL,
  `PreOrderAvailabilityStartDateTimeUtc` datetime DEFAULT NULL,
  `CallForPrice` tinyint(1) NOT NULL,
  `Price` decimal(18,4) NOT NULL,
  `OldPrice` decimal(18,4) NOT NULL,
  `ProductCost` decimal(18,4) NOT NULL,
  `SpecialPrice` decimal(18,4) DEFAULT NULL,
  `SpecialPriceStartDateTimeUtc` datetime DEFAULT NULL,
  `SpecialPriceEndDateTimeUtc` datetime DEFAULT NULL,
  `CustomerEntersPrice` tinyint(1) NOT NULL,
  `MinimumCustomerEnteredPrice` decimal(18,4) NOT NULL,
  `MaximumCustomerEnteredPrice` decimal(18,4) NOT NULL,
  `HasTierPrices` tinyint(1) NOT NULL DEFAULT '0',
  `HasDiscountsApplied` tinyint(1) NOT NULL,
  `Weight` decimal(18,4) NOT NULL,
  `Length` decimal(18,4) NOT NULL,
  `Width` decimal(18,4) NOT NULL,
  `Height` decimal(18,4) NOT NULL,
  `AvailableStartDateTimeUtc` datetime DEFAULT NULL,
  `AvailableEndDateTimeUtc` datetime DEFAULT NULL,
  `DisplayOrder` int(11) NOT NULL,
  `Published` tinyint(1) NOT NULL,
  `Deleted` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedOnUtc` datetime DEFAULT NULL,
  `UpdatedOnUtc` datetime DEFAULT NULL,
  `BrandId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `tbl_merchant_fk_idx` (`VendorId`),
  KEY `Fk_appinfo_product_idx` (`ProductTypeId`),
  CONSTRAINT `fk_tblappinfo_product_s` FOREIGN KEY (`ProductTypeId`) REFERENCES `tblappinfo` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `product_category_mapping` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductId` int(11) NOT NULL,
  `CategoryId` int(11) NOT NULL,
  `IsFeaturedProduct` tinyint(1) NOT NULL,
  `DisplayOrder` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `ProductCategory_Product` (`ProductId`),
  KEY `FK_Product_Category_Mapping_tblCategoryMgmt` (`CategoryId`),
  CONSTRAINT `FK_Product_Category_Mapping_tblCategoryMgmt` FOREIGN KEY (`CategoryId`) REFERENCES `tblcategorymgmt` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ProductCategory_Product` FOREIGN KEY (`ProductId`) REFERENCES `product` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `product_picture_mapping` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductId` int(11) NOT NULL,
  `PictureId` int(11) NOT NULL,
  `DisplayOrder` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Product_Picture_Mapping_tblMediaMgmt` (`PictureId`),
  KEY `ProductPicture_Product` (`ProductId`),
  CONSTRAINT `FK_Product_Picture_Mapping_tblMediaMgmt` FOREIGN KEY (`PictureId`) REFERENCES `tblmediamgmt` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ProductPicture_Product` FOREIGN KEY (`ProductId`) REFERENCES `product` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `productattribute` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL,
  `Description` longtext,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `product_productattribute_mapping` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductId` int(11) NOT NULL,
  `ProductAttributeId` int(11) NOT NULL,
  `TextPrompt` longtext,
  `IsRequired` tinyint(1) NOT NULL,
  `AttributeControlType` varchar(100) NOT NULL,
  `DisplayOrder` int(11) NOT NULL,
  `ValidationMinLength` int(11) DEFAULT NULL,
  `ValidationMaxLength` int(11) DEFAULT NULL,
  `ValidationFileAllowedExtensions` longtext,
  `ValidationFileMaximumSize` int(11) DEFAULT NULL,
  `DefaultValue` longtext,
  PRIMARY KEY (`Id`),
  KEY `ProductAttributeMapping_Product` (`ProductId`),
  KEY `ProductAttributeMapping_ProductAttribute` (`ProductAttributeId`),
  CONSTRAINT `ProductAttributeMapping_Product` FOREIGN KEY (`ProductId`) REFERENCES `product` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `ProductAttributeMapping_ProductAttribute` FOREIGN KEY (`ProductAttributeId`) REFERENCES `productattribute` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `product_specificationattribute_mapping` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductId` int(11) NOT NULL,
  `AttributeTypeId` int(11) NOT NULL,
  `SpecificationAttributeOptionId` int(11) DEFAULT NULL,
  `CustomValue` varchar(4000) DEFAULT NULL,
  `AllowFiltering` tinyint(1) NOT NULL,
  `ShowOnProductPage` tinyint(1) NOT NULL,
  `DisplayOrder` int(11) NOT NULL,
  `SpecificationAttributeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `ProductSpecificationAttribute_Product` (`ProductId`),
  KEY `ProductSpecificationAttribute_SpecificationAttributeOption` (`SpecificationAttributeOptionId`),
  CONSTRAINT `ProductSpecificationAttribute_Product` FOREIGN KEY (`ProductId`) REFERENCES `product` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `ProductSpecificationAttribute_SpecificationAttributeOption` FOREIGN KEY (`SpecificationAttributeOptionId`) REFERENCES `specificationattributeoption` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



CREATE TABLE `productattributecombination` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductId` int(11) NOT NULL,
  `AttributesXml` longtext,
  `StockQuantity` int(11) NOT NULL,
  `AllowOutOfStockOrders` tinyint(1) NOT NULL,
  `Sku` varchar(400) DEFAULT NULL,
  `ManufacturerPartNumber` varchar(400) DEFAULT NULL,
  `Gtin` varchar(400) DEFAULT NULL,
  `OverriddenPrice` decimal(18,4) DEFAULT NULL,
  `NotifyAdminForQuantityBelow` int(11) NOT NULL,
  `AttributeString` varchar(5000) DEFAULT NULL,
  `AttributeValueString` varchar(5000) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `ProductAttributeCombination_Product` (`ProductId`),
  CONSTRAINT `ProductAttributeCombination_Product` FOREIGN KEY (`ProductId`) REFERENCES `product` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `productattributevalue` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductAttributeMappingId` int(11) NOT NULL,
  `AttributeValueTypeId` int(11) NOT NULL,
  `AssociatedProductId` int(11) NOT NULL,
  `Name` varchar(400) NOT NULL,
  `ColorSquaresRgb` varchar(100) DEFAULT NULL,
  `PriceAdjustment` decimal(18,4) NOT NULL,
  `WeightAdjustment` decimal(18,4) NOT NULL,
  `Cost` decimal(18,4) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `IsPreSelected` tinyint(1) NOT NULL,
  `DisplayOrder` int(11) NOT NULL,
  `PictureId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `ProductAttributeValue_ProductAttributeMapping` (`ProductAttributeMappingId`),
  CONSTRAINT `ProductAttributeValue_ProductAttributeMapping` FOREIGN KEY (`ProductAttributeMappingId`) REFERENCES `product_productattribute_mapping` (`Id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `productreview` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `CustomerId` int(11) NOT NULL,
  `ProductId` int(11) NOT NULL,
  `IsApproved` tinyint(1) NOT NULL,
  `Title` longtext,
  `ReviewText` longtext,
  `Rating` int(11) NOT NULL,
  `HelpfulYesTotal` int(11) NOT NULL,
  `HelpfulNoTotal` int(11) NOT NULL,
  `CreatedOnUtc` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_ProductReview_Product` (`ProductId`),
  CONSTRAINT `FK_ProductReview_Product` FOREIGN KEY (`ProductId`) REFERENCES `product` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `productreviewhelpfulness` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductReviewId` int(11) NOT NULL,
  `WasHelpful` tinyint(1) NOT NULL,
  `CustomerId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_ProductReviewHelpfulness_ProductReview` (`ProductReviewId`),
  CONSTRAINT `FK_ProductReviewHelpfulness_ProductReview` FOREIGN KEY (`ProductReviewId`) REFERENCES `productreview` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `producttag` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(400) NOT NULL,
  `Product_Id` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_ProductTag_Product` (`Product_Id`),
  CONSTRAINT `FK_ProductTag_Product` FOREIGN KEY (`Product_Id`) REFERENCES `product` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `producttemplate` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL,
  `ViewPath` varchar(400) NOT NULL,
  `DisplayOrder` int(11) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `relatedproduct` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductId1` int(11) NOT NULL,
  `ProductId2` int(11) NOT NULL,
  `DisplayOrder` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_RelatedProduct_Product` (`ProductId1`),
  KEY `FK_RelatedProduct_Product1` (`ProductId2`),
  CONSTRAINT `FK_RelatedProduct_Product` FOREIGN KEY (`ProductId1`) REFERENCES `product` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_RelatedProduct_Product1` FOREIGN KEY (`ProductId2`) REFERENCES `product` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `tblproductattributecombinationtierprice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductAttributeCombinationId` int(11) DEFAULT NULL,
  `UserRoleId` int(11) DEFAULT NULL,
  `Quantity` int(11) NOT NULL,
  `Price` decimal(18,2) NOT NULL,
  `Type` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_tblProductAttributeCombinationTierPrice_ProductAttribute_idx` (`ProductAttributeCombinationId`),
  CONSTRAINT `` FOREIGN KEY (`ProductAttributeCombinationId`) REFERENCES `productattributecombination` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
