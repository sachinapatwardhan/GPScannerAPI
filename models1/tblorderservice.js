/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblorderservice', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    CustomerId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CustomerPO: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    BillingAddressId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ShippFirstName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ShippLastName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ShippAddress1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ShippAddress2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ShippidCountry: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ShippidState: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ShippidCity: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ShippPostCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    ShippCompanyName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    OrderNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    OrderStatusId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblorderservicestatus',
        key: 'id'
      }
    },
    ImageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ShippingStatusId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PaymentStatusId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PaymentMethodSystemName: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    CustomerCurrencyCode: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CurrencyRate: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    CustomerTaxDisplayTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    VatNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    OrderSubtotalInclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    OrderSubtotalExclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    OrderSubTotalDiscountInclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    OrderSubTotalDiscountExclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    OrderShippingInclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    OrderShippingExclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    PaymentMethodAdditionalFeeInclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    PaymentMethodAdditionalFeeExclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    TaxRates: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    OrderTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    OrderDiscount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    OrderTotal: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    RefundedAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    RewardPointsWereAdded: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CheckoutAttributeDescription: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    CheckoutAttributesXml: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CustomerLanguageId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    AffiliateId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CustomerIp: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    AllowStoringCreditCardNumber: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    CardType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CardName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CardNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    MaskedCreditCardNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CardCvv2: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CardExpirationMonth: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CardExpirationyear: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    AuthorizationTransactionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    AuthorizationTransactionCode: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    AuthorizationTransactionResult: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CaptureTransactionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CaptureTransactionResult: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    SubscriptionTransactionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PurchaseOrderNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    PaidDateUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ShippingMethod: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ShippingRateComputationMethodSystemName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Courier: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    TrackingNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CustomValuesXml: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Deleted: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    Terms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    CreatedOnUtc: {
      type: DataTypes.DATE,
      allowNull: false
    },
    AuthorizeWorkId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ModifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    MerchantId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    P1: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    P2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    P3: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    P4: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    SettlementCur: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    ProcessingCharges: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ExpiryDurationType: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    ExpiryDurationValue: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tblorderservice'
  });
};
