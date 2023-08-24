const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        require:true
    },
    lastname:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    gender:{
        type:String,
        require:true
    },
    phone:{
        type:Number,
        require:true,
        unique:true
    },
    age:{
        type:Number,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    confirmpassword:{
        type:String,
        require:true
    },
    tokens:[{
        token:{
            type:String,
            require:true
        }
    }]
})

userSchema.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString() },"mynameisdeepankarthakurandiloveanime");
        console.log(token);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part"+error)
    }
}

userSchema.pre("save", async function(next){
    
    if(this.isModified("password")){

        console.log(`the current password is ${this.password}`)
        this.password = await bcrypt.hash(this.password, 10);
        console.log(`the current password is ${this.password}`)

        this.confirmpassword = undefined;
    }
    next();
})
//now we need to create a collection

const Register = mongoose.model("Register", userSchema);
module.exports = Register;