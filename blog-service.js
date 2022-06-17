const fs = require("fs"); 
var posts = [];
var categories = [];
var postsToReturn = [];
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", 'utf-8', (err,postsData) => {
            posts = [];
            categories = [];
            if (err) {
                reject(err);
            } else {
                posts = JSON.parse(postsData);    
                fs.readFile("./data/categories.json", 'utf-8', (err,catData) => {
                    if (err) {
                     reject(err);
                    } else {
                        categories = JSON.parse(catData);    
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
            reject();
        }
    })
}
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject();
        }
    })
}
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        postsToReturn = [];
        for (let i = 0; i < posts.length; i++){
            if (posts[i].published === true) {
                postsToReturn.push(posts[i]);
            }
        }
        if (postsToReturn.length > 0) {
            resolve(postsToReturn);
        } else {
            reject();
        }
    })
}
module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        postsToReturn = [];
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].category == category) {
                postsToReturn.push(posts[i]);
            }
        }
        if (postsToReturn.length > 0) {
            resolve(postsToReturn);
        } else {
            reject();
        }
    })
}
module.exports.getPostsById = (id) => {
    return new Promise((resolve, reject) => {
        postsToReturn = [];
        for (let i = 0, done = false; i < posts.length && !done; i++) {
            if (posts[i].id == id) {
                postsToReturn.push(posts[i]);
                done = true;
            }
        }
        if (postsToReturn.length > 0) {
            resolve(postsToReturn);
        } else {
            reject();
        }
    })
}
module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        postsToReturn = [];
        for (let i = 0; i < posts.length; i++) {
            if (new Date(posts[i].postDate) >= new Date(minDateStr)) {
                postsToReturn.push(posts[i]);
            }
        }
        if (postsToReturn.length > 0) {
            resolve(postsToReturn);
        } else {
            reject();
        }
    })
}
module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        if (!postData.published) {
            postData.published = "false";
        } else {
            postData.published = "true";
        }
        postData.id = posts.length + 1;
        posts.push(postData);
        resolve(postData);
    })
}







