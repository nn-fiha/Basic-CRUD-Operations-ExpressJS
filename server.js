require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const uri=process.env.MONGODB_URI
mongoose.connect(uri,{useNewUrlParser:true})

  mongoose.connection.on('connected', function() {
   console.log("Connected to mongo server.");
  
 });
 
 mongoose.connection.on('error', function(err) {
   console.log("Could not connect to mongo server!");
  
 });

 const userSchema=new mongoose.Schema({
   fname:String,
   lname:String,
   email:String,
   age:Number,
   password:String
 },
 {
   timestamps:true
 }
 )

 const User=mongoose.model('User',userSchema)
 
app.use(bodyParser.json())

app.get('/',(req,res)=>{
   res.json({message:'Welcome to our app'})
})

// let users=[]
// let lastId=0

// api to create a user
// app.post('/users',(req,res)=>{
//    const user=req.body
//    user.id=++lastId
//    users.push(user)
//    res.status(201).json(user)
// })

app.post('/users',async(req,res)=>{
   try{
      const salt=await bcrypt.genSalt(10)
      const hash= await bcrypt.hash(req.body.password,salt)
      const password=hash
      const userObj={
         fname:req.body.fname,
         lname:req.body.lname,
         email:req.body.email,
         age:req.body.age,
         password:password
      }
      const user=new User(userObj)
      await user.save()
      res.status(201).json(user)

   }catch(error){
      console.error(error);
      res.status(500).json({message:'something is wrong with the server'})
   }
})

app.post('/users/login',async(req,res)=>{
   try {
      const {email,password}=req.body
      const user= await User.findOne({email:email})
      if(!user){
         res.status(401).json({message:'User not found'})
      }else{
         const  isValidPassword=await bcrypt.compare(password, user.password)
         if(!isValidPassword){
            res.status(401).json({message:'wrong password'})
         }
         else{
            const token= jwt.sign({email:user.email,id:user._id},process.env.JWT_SECRET)
            const userObj=user.toJSON()
            userObj['accessToken']=token
            res.status(200).json(userObj)

         }

      }
      
   } catch (error) {
      console.error(error);
      res.status(500).json({message:'something is wrong with the server'})
   }
})

// app.get('/users',(req,res)=>{
//    res.json(users)
// })

app.get('/users',async(req,res)=>{
   try {
      const users=await User.find({})
      res.json(users)

   } catch (error) {
      console.error(error);
      res.status(500).json({message:'something is wrong with the server'})
   }
  
})

// app.get('/users/:id',(req,res)=>{
//    const id=req.params.id
//    const user=users.find((u)=>u.id==id)
//    if(user){
//       res.json(user)
//    }
//    else{
//       res.status(404).json({message:'User not found'})
//    }
// })

app.get('/users/:id',async(req,res)=>{
   try {
      const id=req.params.id
      const user=await User.findById(id)
      if(user){
         res.json(user)
      }
      else{
         res.status(404).json({message:'User not found'})
      }
      
   } catch (error) {

      console.error(error);
      res.status(500).json({message:'something is wrong with the server'})
      
   }
})

// app.put('/users/:id',(req,res)=>{
//    const id=req.params.id;
//    const body=req.body
//    const user= users.find((u)=>u.id==id);
//    if(user){
//       user.Fname=body.Fname
//       user.Lname=body.Lname
//       res.json(user)
//    }else{
//       res.status(404).json({message:'user not found'})
//    }
// })

app.put('/users/:id',async(req,res)=>{
  try {
   const id=req.params.id;
   const body=req.body
   const user=await User.findByIdAndUpdate(id,body,{new:true})
   if(user){
      res.json(user)
   }else{
      res.status(404).json({message:'user not found'})
   }
  } catch (error) {

   console.error(error);
      res.status(500).json({message:'something is wrong with the server'})
   
  }
})



// app.delete('/users/:id',(req,res)=>{
//    const id=req.params.id;
//    const userIndex= users.findIndex((u)=>u.id==id);
//    if(userIndex){
//    users.splice(userIndex,1)
//    res.json(users)
//    }else{
//       res.status(404).json({message:'user not found'})
//    }

// })

app.delete('/users/:id',async(req,res)=>{
   try {
      const id=req.params.id;
   const user=await User.findByIdAndDelete(id)
   if(user){
   res.json(user)
   }else{
      res.status(404).json({message:'user not found'})
   }
   } catch (error) {

      console.error(error);
      res.status(500).json({message:'something is wrong with the server'})
      
   }

})






const port = process.env.PORT; // Change the port number to any available port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});