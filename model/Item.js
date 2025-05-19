const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bidSchema = new Schema({
  bidder: {
    type: Schema.Types.ObjectId,
    ref: 'AuctionUser',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const itemSchema = new Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  startingBid: {
    type: Number,
    required: true,
    min: 0
  },
  reservePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentBid: {
    type: Number,
    default: 0
  },
  bids: [bidSchema],
  auctionDuration: {
    type: Number,
    required: true,
    default: 7,
    min: 1
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'AuctionUser',
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  shippingInfo: {
    shippingMethod: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard'
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0
    },
    estimatedDelivery: {
      type: String,
      required: true
    }
  },
  termsAndConditions: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'refurbished'],
    default: 'new'
  },
  status: {
    type: String,
    enum: ['pending', 'rejected', 'approved'],
    default: 'pending'
  },
  images: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  auctionEnd: {
    type: Date,
    default: function() {
      return new Date(Date.now() + this.auctionDuration * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;