const mongoose = require('mongoose');

const connectDB = async ()=>{
try{
    await mongoose.connect('mongodb://127.0.0.1:27017/auction',{
        
    });

    console.log('Loacl Mongo connected');
}
catch(error){
    console.error('Connection Failed', error.message);
    
}
};

module.exports =connectDB;