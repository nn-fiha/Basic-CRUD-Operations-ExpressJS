require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const uri=process.env.MONGODB_URI
mongoose.connect(uri,{useNewUrlParser:true})

  mongoose.connection.on('connected', function() {
   console.log("Connected to mongo server.");
  
 });
 
 mongoose.connection.on('error', function(err) {
   console.log("Could not connect to mongo server!");
  
 });

app.use(bodyParser.json())

app.get('/',(req,res)=>{
   res.json({message:'Welcome to our app'})
})

let users=[]
let lastId=0

// api to create a user
app.post('/users',(req,res)=>{
   const user=req.body
   user.id=++lastId
   users.push(user)
   res.status(201).json(user)
})

app.get('/users',(req,res)=>{
   res.json(users)
})

app.get('/users/:id',(req,res)=>{
   const id=req.params.id
   const user=users.find((u)=>u.id==id)
   if(user){
      res.json(user)
   }
   else{
      res.status(404).json({message:'User not found'})
   }
})

app.put('/users/:id',(req,res)=>{
   const id=req.params.id;
   const body=req.body
   const user= users.find((u)=>u.id==id);
   if(user){
      user.Fname=body.Fname
      user.Lname=body.Lname
      res.json(user)
   }else{
      res.status(404).json({message:'user not found'})
   }
})

app.delete('/users/:id',(req,res)=>{
   const id=req.params.id;
   const userIndex= users.findIndex((u)=>u.id==id);
   if(userIndex){
   users.splice(userIndex,1)
   res.json(users)
   }else{
      res.status(404).json({message:'user not found'})
   }

})






const port = process.env.PORT; // Change the port number to any available port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});