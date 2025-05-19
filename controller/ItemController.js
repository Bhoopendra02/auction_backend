const Item = require('../model/Item');
const { checkRole } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Public Routes
const category = async (req, res) => {
  try {
    const categories = await Item.distinct('category'); // Gets unique category names
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};

// module.exports = router;

const getAllApproveItem = async (req, res) => {
  try {
    const items = await Item.find({ status: "approved" })
      .populate('seller', 'username email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true,
      message: 'Fetched all approved items',
      items
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

 const getAll =async(req,res)=>{
    try{
        const item = await Item.find();
        res.status(200).json({ message:'Fetched all users',item})

    }
    catch(err){
        res.status(500).json({message:'Server Error',err})
    }
}

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'username email');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const getItemsByCategory = async (req, res) => {
  try {
    const items = await Item.find({ 
      category: req.params.categoryName,
      status: 'approved'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: `Fetched items in category: ${req.params.categoryName}`,
      items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Seller Routes
const createItem = [
  checkRole(['seller']),
  upload.array('images', 5),
  async (req, res) => {
    try {
      const {
        itemName,
        startingBid,
        reservePrice,
        auctionDuration,
        location,
        features,
        description,
        shippingInfo,
        termsAndConditions,
        category,
        condition
      } = req.body;

      // Get seller ID from authenticated user
      const seller = req.userData.userId;
      
      // Parse features if it's a string
      let parsedFeatures = [];
      if (features) {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
      }

      // Parse shippingInfo if it's a string
      let parsedShippingInfo = {};
      if (shippingInfo) {
        parsedShippingInfo = typeof shippingInfo === 'string' ? JSON.parse(shippingInfo) : shippingInfo;
      }

      // Get uploaded images
      const images = req.files ? req.files.map(file => file.path) : [];

      const item = new Item({
        itemName,
        startingBid,
        reservePrice,
        auctionDuration,
        location,
        features: parsedFeatures,
        seller,
        description,
        shippingInfo: parsedShippingInfo,
        termsAndConditions,
        category,
        condition,
        images
      });

      const savedItem = await item.save();
      res.status(201).json({
        success: true,
        message: "Auction created successfully",
        item: savedItem
      });
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
];

const updateItem = [
  checkRole(['seller']),
  upload.array('images', 5),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verify the item belongs to the seller
      const item = await Item.findOne({ _id: id, seller: req.userData.userId });
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item not found or you don't have permission to edit it"
        });
      }

      // Handle features and shippingInfo if they're strings
      if (updateData.features && typeof updateData.features === 'string') {
        updateData.features = JSON.parse(updateData.features);
      }
      if (updateData.shippingInfo && typeof updateData.shippingInfo === 'string') {
        updateData.shippingInfo = JSON.parse(updateData.shippingInfo);
      }

      // Handle image uploads
      if (req.files && req.files.length > 0) {
        updateData.images = req.files.map(file => file.path);
      }

      // Update the item
      const updatedItem = await Item.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: "Item updated successfully",
        item: updatedItem
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
];

const deleteItem = [
  checkRole(['seller']),
  async (req, res) => {
    try {
      const item = await Item.findOneAndDelete({ 
        _id: req.params.id, 
        seller: req.userData.userId 
      });
      
      if (!item) {
        return res.status(404).json({ 
          success: false,
          message: "Item not found or you don't have permission to delete it" 
        });
      }

      res.status(200).json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: err.message
      });
    }
  }
];

const getMyItems = [
  checkRole(['seller']),
 async (req, res) => {
    try {
      const items = await Item.find({ seller: req.userData.userId })
        .sort({ createdAt: -1 })
        .populate('seller', 'username email'); // Optional: populate seller info

      res.status(200).json({
        success: true,
        message: 'Fetched all your items',
        count: items.length,
        items
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
];

// Admin Routes
const getAllAuction = async (req, res) => {
  try {
    const items = await Item.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Fetched all auction items',
      items
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

const approveItem = [
  checkRole(['admin']),
  async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ 
          success: false,
          message: 'Item not found' 
        });
      }
      
      item.status = 'approved';
      item.approvedAt = new Date();
      await item.save();
      
      res.json({
        success: true,
        message: 'Item approved successfully',
        item
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
];

const rejectItem = [
  checkRole(['admin']),
  async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      item.status = 'rejected';
      item.rejectedAt = new Date();
      item.rejectionReason = req.body.rejectionReason;
      await item.save();
      
      res.json({
        success: true,
        message: 'Item rejected successfully',
        item
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
];

const getMyBiddedAuctions = async (req, res) => {
  try {
    const userId = req.userData.userId;
    
    // Find all items where the user has placed bids
    const items = await Item.find({
      'bids.bidder': userId,
      status: 'approved'
    })
    .populate('seller', 'username email')
    .sort({ createdAt: -1 });

    // Format the response to include bid information
    const formattedItems = items.map(item => {
      const userBids = item.bids.filter(bid => bid.bidder.toString() === userId);
      return {
        ...item.toObject(),
        userBids: userBids,
        highestBid: Math.max(...userBids.map(bid => bid.amount)),
        totalBids: userBids.length
      };
    });

    res.status(200).json({
      success: true,
      message: 'Fetched all auctions where you have placed bids',
      items: formattedItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const placeBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.userData.userId;
    console.log(userId);
    

    // Find the item
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if auction is still active
    if (item.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This auction is not active'
      });
    }

    if (new Date() > item.auctionEnd) {
      return res.status(400).json({
        success: false,
        message: 'This auction has ended'
      });
    }

    // Validate bid amount
    if (amount <= item.currentBid) {
      return res.status(400).json({
        success: false,
        message: 'Bid must be higher than current bid'
      });
    }

    if (amount < item.startingBid) {
      return res.status(400).json({
        success: false,
        message: 'Bid must be at least the starting bid amount'
      });
    }

    // Add the bid
    item.bids.push({
      bidder: userId,
      amount: amount,
      timestamp: new Date()
    });

    // Update current bid
    item.currentBid = amount;

    await item.save();

    // Get updated item with populated bidder information
    const updatedItem = await Item.findById(id)
      .populate('bids.bidder', 'username email')
      .populate('seller', 'username email');

    res.status(200).json({
      success: true,
      message: 'Bid placed successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  // Public routes
  getAll,
  getAllApproveItem,
  getItemById,
  getItemsByCategory,
  category,
  // Seller routes
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
  
  // Admin routes
  getAllAuction,
  approveItem,
  rejectItem,
  // User routes
  getMyBiddedAuctions,
  placeBid
};