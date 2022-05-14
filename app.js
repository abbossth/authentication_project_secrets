//jshint esversion:6
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')
const bcrypt = require('bcrypt')

const app = express()

const saltRounds = 10

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true })

const userSchema = new mongoose.Schema ({
  username: String,
  password: String
})

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]})

const User = mongoose.model('User', userSchema)

// ROOT ROUTE
app.get('/', function(req,res) {
  res.render('home')
})

// LOGIN ROUTE
app.get('/login', function(req,res) {
  res.render('login')
})

app.post('/login', function(req,res) {
  const username = req.body.username
  const password = req.body.password
  User.findOne({ username: username }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (err) throw err;
          else {
            if (result === true) {
              res.render('secrets', { username: username })
            } else {
              res.send("Incorrect password")
            }
          }
        })
      } else {
        res.send("User Not Found")
      } 
    }
  })
})

// REGISTER ROUTE
app.get('/register', function(req,res) {
  res.render('register')
})

app.post('/register', function(req,res) {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    if (err) throw err;
    else {
      const newUser = new User ({
        username: req.body.username,
        password: hash
      })
      newUser.save(function (err) {
        if (err) console.log(err)
        else {
          res.render('secrets', { username: req.body.username })
        }
      }) 
    }
  });
})

app.get("/users", function(req,res) {
  User.find({ }, function(err,foundUsers) {
    if(!err) {
      res.send(foundUsers)
    } else {
      console.log(err);
    }
  })
})


app.listen(3000, function() {
  console.log(`Server is up and running on port ${ 3000 }`);
})
