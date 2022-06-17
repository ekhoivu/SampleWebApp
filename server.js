/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Khoi Vu Student ID: 124611203 Date: June 15th, 2022
*
*  Online (Heroku) URL: https://safe-meadow-94435.herokuapp.com/
*
*  GitHub Repository URL: https://github.com/ekhoivu/web322-app
*
********************************************************************************/ 


var express = require("express");
const path = require ('path');

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

var blog_service = require(path.join(__dirname, '/blog-service.js'));

var app = express();
var HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: 'kvu8',
  api_key: '674395424882258',
  api_secret: '3Po1AEEAkkeUSuUpmkaeBgk6bWg',
  secure: true
});
const upload = multer(); 

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
app.get("/posts", (req, res) => {
  const cat = req.query.category;
  const minDateStr = req.query.minDate;
  const id = req.query.id;
  if (cat) {
    blog_service.getPostsByCategory(cat).then((data) => {
    res.json(data);
  }).catch((error) => {
    console.log(error);
    res.status(404).send("There is no post in that category!");
  })
  } else if (minDateStr) {
    blog_service.getPostsByMinDate(minDateStr).then((data) => {
      res.json(data);
    }).catch((error) => {
      console.log(error);
      res.status(404).send("There is no post on or after that date!");
    })
  } else if (id) {
    blog_service.getPostsById(id).then((data) => {
      res.json(data);
    }).catch((error) => {
      console.log(error);
      res.status(404).send("There is no post by that Id");
    })
  } else {
    blog_service.getAllPosts().then((data) => {
      res.json(data);
    })
  } 
})
// setup another route to listen on /categories
app.get("/categories", (req,res) => {
  blog_service.getCategories().then((data) => {
  res.json(data);
})
})
// setup another route to listen on /addPosts
app.get("/posts/add", (req,res) => {
  res.sendFile(path.join(__dirname, '/views/addPost.html'));
})

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if(req.file){
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    upload(req).then((uploaded)=>{
        processPost(uploaded.url);
    });
}else{
    processPost("");
}
function processPost(imageUrl){
    req.body.featureImage = imageUrl;
    blog_service.addPost(req.body);
    res.redirect('/posts');
    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
} 
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

