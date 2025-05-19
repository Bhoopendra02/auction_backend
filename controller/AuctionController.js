const AuctionUser = require('../model/AuctionLogin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

// Input validation helper
const validateRegisterInput = (username, email, password, confirmPassword, role) => {
  if (!username || !email || !password || !confirmPassword || !role) {
    return 'All fields are required';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

exports.register = async (req, res) => {
  try {
    const { username, email, role, password, confirmPassword } = req.body;

    // Validate input
    const validationError = validateRegisterInput(username, email, password, confirmPassword, role);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // Check if user exists
    const existingUser = await AuctionUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = new AuctionUser({
      username,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    // Return response without sensitive data
    res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await AuctionUser.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Create token payload
    const tokenPayload = {
      userId: user._id,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await AuctionUser.find().select('-password');
    res.status(200).json({ 
      success: true,
      message: 'Fetched all users',
      users
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

exports.UserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AuctionUser.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching user details", 
      error: error.message 
    });
  }
};

















// const AuctionUser =require('../model/AuctionLogin');
// const jwt = require('jsonwebtoken');

// require('dotenv').config(); // ✅ Make sure this is at the top

// const JWT_SECRET = process.env.JWT_SECRET;

// exports.register = async(req,res)=>{
//     try{   
       
//         const {username, email,role, password, confirmPassword} =req.body;
//         const existingUser= await AuctionUser.findOne({email});
//         if(existingUser) return res.status(400).json({message:"User already exists"})
            
//         const newuser =new AuctionUser({
//             username,
//             email,
//             password,
//             confirmPassword,
//             role
//         })

        
        
//             if(!newuser){
//               res.status(400).json('User Not created')

//             }else{
//               res.status(200)
//               res.json({
//                 id:newuser._id,
//                 username:  newuser,
//                 email : newuser.email,
//             password  : newuser.password,
//             confirmPassword : newuser.confirmPassword,
//             role,
//              })
//             }
         

//         await newuser.save()
//         res.json({message:"Registered Successfully", newuser})
      
//     } catch(err){
//         console.log(err.response?.data);
  
//         res.status(500).json({message:"Server Error", err})
//     }
// }

// exports.userlogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

   
//     const user = await AuctionUser.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'User not found' 
//       });
//     }

//     // Compare plain text passwords (INSECURE - only for testing)
//     if (user.password !== password) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Invalid credentials' 
//       });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       {
//         id: user._id,
//         email: user.email,
//         role: user.role
//       },
//       JWT_SECRET,
//       { expiresIn: '1h' }
//     );

  


//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token, user
      
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error', 
//       error: err.message 
//     });
//   }
// };


// exports.getAll =async(req,res)=>{
//     try{
//         const users = await AuctionUser.find();
//         res.status(200).json({ message:'Fetched all users',users})

//     }
//     catch(err){
//         res.status(500).json({message:'Server Error',err})
//     }
// }

// exports.UserById = async (req, res) => {
//     try {
//         const { id } = req.params; // Extract ID from request parameters
//         const user = await AuctionUser.findById(id);

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Return only required fields
//         const userDetails = {
//             username: user.username,
//             email: user.email,
//             password:user.password,
//             // phone: user.phone,
//             // isVerified: user.isVerified,
//             // role: user.role,
//             // username: user.username,
//         };

//         res.status(200).json(userDetails);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching user details", error });
//     }
// };
