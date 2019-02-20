/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
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
      type: DataTypes.STRING,
      allowNull: true
    },
    BillingAddressId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ShippFirstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ShippLastName: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: true
    },
    ShippPostCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ShippCompanyName: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: true
    },
    CustomerCurrencyCode: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: true
    },
    AllowStoringCreditCardNumber: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    CardType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CardName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CardNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MaskedCreditCardNumber: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: true
    },
    AuthorizationTransactionResult: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CaptureTransactionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CaptureTransactionResult: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SubscriptionTransactionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PurchaseOrderNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PaidDateUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ShippingMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ShippingRateComputationMethodSystemName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Courier: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TrackingNumber: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: true
    },
    P2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    P3: {
      type: DataTypes.STRING,
      allowNull: true
    },
    P4: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SettlementCur: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ProcessingCharges: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ExpiryDurationType: {
      type: DataTypes.STRING,
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
