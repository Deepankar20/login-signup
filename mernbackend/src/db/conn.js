const path = require("path");
require('dotenv').config({path: path.resolve(__dirname, './.env') })
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI,{

}).then(()=>{
    console.log("connection successful");
}).catch((e)=>{
    console.log('unsuccessful');
})