/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Khoi Vu Student ID: 124611203 Date: July 4th, 2022
*
*  Online (Heroku) URL: https://safe-meadow-94435.herokuapp.com/
*
*  GitHub Repository URL: https://github.com/ekhoivu/web322-app
*
********************************************************************************/ 


var express = require("express");
const path = require ('path');

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

//var blog_service = require(path.join(__dirname, '/blog-service.js'));
const blogData = require("./blog-service");

var app = express();
var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

cloudinary.config({
  cloud_name: 'kvu8',
  api_key: '674395424882258',
  api_secret: '3Po1AEEAkkeUSuUpmkaeBgk6bWg',
  secure: true
});

const upload = multer(); 

app.use(express.urlencoded({extended: true}));

app.engine('.hbs', exphbs.engine({ extname: '.hbs',
helpers: {
  navLink: function(url, options){
    return '<li' +
    ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
    '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
  equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
      return options.inverse(this);
      } else {
      return options.fn(this);
      }
      },
  safeHTML: function(context){
      return stripJs(context);
  },
  formatDate: function(dateObj){
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
  }
      
} }));

app.set('view engine', '.hbs');

app.use(express.static('public'));

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
  });

// setup http server to listen on HTTP_PORT
blogData.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart)
  }).catch((error) => {
    console.log(error)
  });

  // setup another route to listen on /blog
app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogData.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", (req,res) => {
    res.redirect('/blog');
})

// setup another route to listen on /about
app.get("/about", (req,res) => {
  res.render('about');
})

// setup another route to listen on /posts
app.get("/posts", (req, res) => {
  if (req.query.category) {
    blogData.getPostsByCategory(req.query.category).then((data) => {
      if (data.length > 0) {
        res.render("posts", {posts: data}); // res.json(data);
      } else {
        res.render("posts", {message: "no results"});
      }
  }).catch((error) => {
    console.log(error);
    res.render("posts", {message: "no results"});; // res.status(404).send("There is no post in that category!");
  })
  } else if (req.query.minDate) {
    blogData.getPostsByMinDate(req.query.minDate).then((data) => {
      if (data.length > 0) {
        res.render("posts", {posts: data}); // res.json(data);
      } else {
        res.render("posts", {message: "no results"});
      }
    }).catch((error) => {
      console.log(error);
      res.render("posts", {message: "no results"});; // res.status(404).send("There is no post on or after that date!");
    })
} else {
    blogData.getAllPosts().then((data) => {
      if (data.length > 0) {
        res.render("posts", {posts: data}); 
      } else {
        res.render("posts", {message: "no results"});
      }
    })
  } 
})

// setup another route to listen on /addPosts
app.get("/posts/add", (req,res) => {
  blogData.getCategories().then((data) => {
    res.render('addPost', {categories: data});
  }).catch((err) => {
    res.render('addPost', {categories: []}); 
  })
})

app.get("/categories/add", (req,res) => {
  res.render('addCategory');
})

app.post("/categories/add", (req,res) => {
  blogData.addCategory(req.body);
  res.redirect('/categories');
})

app.get("/categories/delete/:id", (req,res) => {
  blogData.deleteCategoryById(req.params.id).then(() => {
    res.redirect('/categories')
  }).catch((err) => {
    res.status(500).send("Unable to Remove Category / Category not found.");
  })
})

app.get("/posts/delete/:id", (req,res) => {
  blogData.deletePostById(req.params.id).then(() => {
    res.redirect('/posts')
  }).catch((err) => {
    res.status(500).send("Unable to Remove Post / Post not found.");
  })
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
    blogData.addPost(req.body).then((data) => {
      res.redirect('/posts');
    }).catch((error) => {
      res.status(500).send(error);
    });
} 
})

// setup another route to listen on /categories
app.get("/categories", (req,res) => {
  blogData.getCategories().then((data) => {
    if (data.length > 0) {
      res.render("categories", {categories: data}); 
    } else {
      res.render("categories", {message: "no results"});
    }
}).catch((error) => {
  console.log(error);
  res.render("categories", {message: "no results"});
})
})

app.get("*", (req,res) => {
  res.render('404', {
    data: null,
    layout: 'main'
  });
})




