
const RealEstateCalculator = require('./calculator.js');

const inputs = {"propertySize": 1189, "totalValue": 1560000, "downPaymentPercent": 20, "registrationFeePercent": 4, "tenure": 25, "discountRate": 4, "rentalROI": 6, "serviceChargesPerSqFt": 10, "exitValue": 1664600};
const results = RealEstateCalculator.calculateInvestment(inputs);
console.log(JSON.stringify(results, null, 2));
