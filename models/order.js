const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerAddress: { type: String, required: true },
  customerPhoneNumber: { type: String, required: true }, // Change to String for consistency
  customerEmail: { type: String, required: true },
  // Payment field to handle different payment types
  paymentMethod: { type: String, enum: ['cash', 'credit'], required: true },
  
  // Store credit card details only if payment method is credit
  creditCardDetails: {
    cardNumber: { type: String},  // Required only if payment is credit
    cardHolderName: { type: String},
    expiryDate: { type: String},
    cvv: { type: String }
  },

  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true }, // Store item name
    price: { type: Number, required: true }, // Store item price
    quantity: { type: Number, required: true, min: 1 }
  }],
  totalPrice: { type: Number, required: true }, // Store total price of the order
  status: { type: String, default: 'READY FOR DELIVERY' },
  orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);