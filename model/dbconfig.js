const mongoose = require('mongoose');

const connectDB = async ()=>{
try{
    await mongoose.connect('mongodb+srv://root:root@cluster0.bjjjoxa.mongodb.net/auction',{
        
    });

    console.log('Loacl Mongo connected');
}
catch(error){
    console.error('Connection Failed', error.message);
    
}
};

module.exports =connectDB;