const mongoose =require('mongoose')
const Schema = mongoose.Schema

const AuctionUserSchema = new Schema({
    username:{
     type:String,
     required: true,
     minlength:4,
     trim:true,
    //  unique:true
    },
    email:{
     type:String,
     required: true,
     trim:true,
    //  unique:true
    },
    password:{
     type:String,
    //  required: true,
    //  minlength:6,
     
     
    },
   
    role: {
    type: String,
    enum: ['user', "seller",'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
})

const AuctionUser = mongoose.model('AuctionUser',AuctionUserSchema);

module.exports =AuctionUser;