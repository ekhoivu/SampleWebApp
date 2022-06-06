/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Khoi Vu Student ID: 124611203 Date: June 5th, 2022
*
*  Online (Heroku) URL: ________________________________________________________
*
*  GitHub Repository URL: ______________________________________________________
*
********************************************************************************/ 


var express = require("express");
const path = require ('path');

var blog_service = require(path.join(__dirname, '/blog-service.js'));

var app = express();
var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", (req,res) => {
    res.redirect('/about');
})

// setup another route to listen on /about
app.get("/about", (req,res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
})

// setup another route to listen on /blog
app.get("/blog", (req,res) => {
  blog_service.getPublishedPosts().then((data) => {
    res.json(data);
  })  
})

// setup another route to listen on /posts
app.get("/posts", (req,res) => {
  blog_service.getAllPosts().then((data) => {
    res.json(data);
  })
})

// setup another route to listen on /categories
app.get("/categories", (req,res) => {
  blog_service.getCategories().then((data) => {
  res.json(data);
})
})

app.get("*", (req,res) => {
  res.status(404).send('Sorry you have entered a wrong address. Please click back on your browser.');
})


// setup http server to listen on HTTP_PORT
blog_service.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart)
  }).catch((error) => {
    console.log(error)
  })

