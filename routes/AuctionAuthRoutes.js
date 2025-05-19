const express = require('express');
const router = express.Router();

const AuctionController =require('../controller/AuctionController')

router.post("/register",AuctionController.register);
router.post("/userlogin",AuctionController.userlogin);
router.get("/getAll",AuctionController.getAll);
router.get("/UserById/:id",AuctionController.UserById);
module.exports =router;