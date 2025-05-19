const User = require('../model/AuctionLogin');
const Otp = require('../model/Otp');
require('dotenv').config();
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const mongoose = require("mongoose");

// this is a send otp code

function generateOTP(){
    return Math.floor(100000 + Math.random() * 900000).toString();  //6 digit
  }
  exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    const otp = generateOTP();
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      await Otp.deleteMany({ email });
  
      const otpDoc = new Otp({
        email,
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      await otpDoc.save();
  
      const msg = {
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Your OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center;">OTP Verification</h2>
            <p>Hello,</p>
            <p>Thank you for signing up. Please use the OTP below to verify your email:</p>
            <div style="font-size: 24px; font-weight: bold; text-align: center; padding: 15px; background: #f4f4f4; border-radius: 5px;">
              ${otp}
            </div>
            <p style="margin-top: 20px;">If you didn’t request this, please ignore this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <h3 style="color: #2c3e50;">Need Help?</h3>
            <p>If you have any questions or need assistance, feel free to reach out to our support team:</p>
            <p>
              📧 Email: <a href="mailto:zerobroker8134@gmail.com" style="color: #3498db;">zerobroker8134@gmail.com</a>
            </p>
            <p>Best Regards, <br> <strong>Zero Broker</strong></p>
          </div>
        `,
      };
      
      await sgMail.send(msg);
      res.json({ success: true, message: 'OTP sent successfully' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
  };

// verify user 

  exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      // 1. Find the OTP record
      const otpDoc = await Otp.findOne({ email, code: otp });
  
      if (!otpDoc) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }
  
      // 2. Check if OTP is expired
      if (otpDoc.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'OTP has expired' });
      }
  
      // 3. Find the user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // 4. Mark user as verified
      user.isVerified = true;
      await user.save();
  
      // 5. (Optional) Delete the used OTP
      await Otp.deleteMany({ email });
  
      // 6. Send response
      res.json({ success: true, message: 'Email verified successfully' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error during verification' });
    }
  };