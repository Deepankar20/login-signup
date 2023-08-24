const express = require('express');
const path = require('path');
const app = express();
const hbs = require("hbs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("../src/middleware/auth");

require("../src/db/conn");
const Register = require("./models/registers");
const static_path = path.join(__dirname,"../public")
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}))

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get('/',(req,res)=>{
    res.render('index');
})

app.get('/secret',auth,(req,res)=>{
    // console.log(`this is the cookie : ${req.cookies.jwt}`);
    res.render('secret');
})


app.get('/logout', auth, async (req,res) =>{
    try {

        // for single device logout
        // req.user.tokens = req.user.tokens.filter((currentEl)=>{
        //     return currentEl.token !== req.token;
        // })

        //for logout from all devices
        req.user.tokens = [];
        res.clearCookie("jwt");

        console.log("logout successfully");
        await req.user.save();
        res.render("login");


    } catch (error) {
        res.status(500).send(error);
    }
})

app.get("/register",(req,res)=>{
    res.render("register.hbs");
})
//create new user in our database
app.post("/register", async (req,res)=>{
   try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    if(password === cpassword){
        const registerEmployee = new Register({
            firstname: req.body.firstname,
            lastname:req.body.lastname,
            email : req.body.email,
            gender : req.body.gender,
            phone : req.body.phone,
            age : req.body.age,
            password : req.body.password,
            confirmpassword: req.body.confirmpassword
        }) 

        const token = await registerEmployee.generateAuthToken();

        res.cookie("jwt", token, {
            expires: new Date(Date.now()+3000), 
            httpOnly:true
        });

        //password hash


        const registered = await registerEmployee.save();
        res.status(201).render('index');
    }else{
        res.send("Passwords not matching")
    }

   } catch (error) {
        res.status(400).send(error);
   }
})


app.get("/login",(req,res)=>{
    res.render("login");
})

app.post('/login', async (req,res)=>{
    try {
        
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email})

        const isMatch = await bcrypt.compare(password, useremail.password);
        const token = await useremail.generateAuthToken();

        res.cookie("jwt", token, {
            expires: new Date(Date.now()+500000), 
            httpOnly:true,
            // secure:true
        });

       


        if(isMatch){
            res.status(201).render("index");
        }
        else{
            res.send("Invalid login details")
        }


    } catch (error) {
        res.status(400).send("Invalid login details")
    }
})

const port = 5000;


const bcrypt = require("bcryptjs");

// const securePassword = async (password)=>{
//     const passwordHash = await bcrypt.hash(password,10);
//     console.log(passwordHash);

//     const passwordmatch= await bcrypt.compare(password,passwordHash);
//     console.log(passwordmatch);
// }

// securePassword("1234");





app.listen(port,()=>{
    console.log(`server is listening on port ${port}`);
})