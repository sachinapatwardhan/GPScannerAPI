/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ProductTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    ParentGroupedProductId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    VisibleIndividually: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ShortDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    FullDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    AdminComment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ProductTemplateId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    VendorId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ShowOnHomePage: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    MetaKeywords: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MetaDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    MetaTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AllowCustomerReviews: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    ApprovedRatingSum: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    NotApprovedRatingSum: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    ApprovedTotalReviews: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    NotApprovedTotalReviews: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    SubjectToAcl: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    LimitedToStores: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Sku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ManufacturerPartNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Gtin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsGiftCard: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    GiftCardTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    RequireOtherProducts: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    RequiredProductIds: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AutomaticallyAddRequiredProducts: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    IsDownload: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    DownloadId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    UnlimitedDownloads: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    MaxNumberOfDownloads: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    DownloadExpirationDays: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    DownloadActivationTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    HasSampleDownload: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    SampleDownloadId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    HasUserAgreement: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    UserAgreementText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IsRecurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    RecurringCycleLength: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    RecurringCyclePeriodId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    RecurringTotalCycles: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    IsRental: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    RentalPriceLength: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    RentalPricePeriodId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    IsShipEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    IsFreeShipping: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    ShipSeparately: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    AdditionalShippingCharge: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    DeliveryDateId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    IsTaxExempt: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    TaxCategoryId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    IsTelecommunicationsOrBroadcastingOrElectronicServices: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    ManageInventoryMethodId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    UseMultipleWarehouses: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    WarehouseId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    StockQuantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    DisplayStockAvailability: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    DisplayStockQuantity: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    MinStockQuantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    LowStockActivityId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    NotifyAdminForQuantityBelow: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    BackorderModeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    AllowBackInStockSubscriptions: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    OrderMinimumQuantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    OrderMaximumQuantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    AllowedQuantities: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AllowAddingOnlyExistingAttributeCombinations: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    DisableBuyButton: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    DisableWishlistButton: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    AvailableForPreOrder: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    PreOrderAvailabilityStartDateTimeUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CallForPrice: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Price: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    OldPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    ProductCost: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    SpecialPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    SpecialPriceStartDateTimeUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    SpecialPriceEndDateTimeUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CustomerEntersPrice: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    MinimumCustomerEnteredPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    MaximumCustomerEnteredPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    HasTierPrices: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    HasDiscountsApplied: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Weight: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    Length: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    Width: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    Height: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    AvailableStartDateTimeUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    AvailableEndDateTimeUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DisplayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Published: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    CreatedOnUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UpdatedOnUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    BrandId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'product'
  });
};
