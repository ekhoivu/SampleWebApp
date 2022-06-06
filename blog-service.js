const fs = require("fs"); 

var posts = [];
var categories = [];
var pubPosts = [];

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", 'utf-8', (err,postsData) => {
            if (err) {
                reject("Unable to read file");
            } else {
                posts = JSON.parse(postsData);    
                //posts.push(JSON.parse(postsData.toString()));   
                fs.readFile("./data/categories.json", 'utf-8', (err,catData) => {
                    if (err) {
                     reject("Unable to read file");
                    } else {
                        categories = JSON.parse(catData);    
                        //categories.push(JSON.parse(catData.toString()));  
                    }
                });
                resolve();
            }
        })
    })
}

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            resolve(posts);
        } else {
            reject("No posts to return");
        }
    })
}

module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < posts.length; i++){
            if (posts[i].published === true) {
                pubPosts.push(posts[i]);
            }
        }
        if (pubPosts.length > 0) {
            resolve(pubPosts);
        } else {
            reject("No published posts to return");
        }
    })
}

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("No posts to return");
        }
    })
}






