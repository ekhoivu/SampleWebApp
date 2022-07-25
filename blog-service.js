const Sequelize = require('sequelize');
var sequelize = new Sequelize("d924pbhus3khsf", "dtdwqtfgwuzmmr", "b28ba9d27b5f4322badfdc01d6d3739e06a9ae809c0ecf2c6a69650374070550", 
    {
    host: "ec2-54-152-28-9.compute-1.amazonaws.com",
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Op = Sequelize.Op;
var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});
var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
    sequelize.sync().then(function () {
        console.log("Connection has been established successfully.");
        resolve();
    }).catch((err) => {
        console.log("Unable to connect to the database: "+err);
    })
})
};
module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
    Post.findAll().then((data) => {
        resolve(data);
    }).catch((err) => {
        reject("No results returned.")
    })
})
};
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
    Post.findAll({
        where: {
            published: true
        }
    }).then((data) => {
        resolve(data);
    }).catch((err) => {
        reject("No results returned.")
    })
})
}
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
    Category.findAll().then((data) => {
        resolve(data);
    }).catch((err) => {
        reject("No results returned.")
    })
})
}
module.exports.getPostsByCategory = (cat) => {
    return new Promise((resolve, reject) => {
    Post.findAll({
        where: {
            category: cat
        }
    }).then((data) => {
        resolve(data);
    }).catch((err) => {
        reject("No results returned.")
    })
})
}
module.exports.getPublishedPostsByCategory = (cat) => {
    return new Promise((resolve, reject) => {
    Post.findAll({
        where: {
            published: true,
            category: cat
        }
    }).then((data) => {
        resolve(data);
    }).catch((err) => {
        reject("No results returned.")
    })
})
}
module.exports.getPostById = (index) => {
    return new Promise((resolve, reject) => {
    Post.findAll({
        where: {
            id: index
        }
    }).then((data) => {
        resolve(data[0]);
    }).catch((err) => {
        reject("No results returned.")
    })
})
}
module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
    Post.findAll({
        where: {
            postDate: {[Op.gte] : new Date(minDateStr)}
        }
    }).then((data) => {
        resolve(data);
    }).catch((err) => {
        reject("No results returned.")
    })
})
}
module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
    postData.published = (postData.published) ? true : false;
    for (const property in postData) {
        if (property == "") {
            property = null;
        }
    }
    if (postData.featureImage == "") {
        postData.featureImage = "https://dummyimage.com/847x320/d9d9d9/545454.jpg";
    }
    postData.postDate = new Date();
    Post.create(postData).then(() => {
        resolve("The post has been added.");
    }).catch((err) => {
        reject("Unable to create the post.")
    })
})
}
module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
    for (const property in categoryData) {
        if (property == "") {
            property = null;
        }
    }
    Category.create(categoryData).then(() => {
        resolve("The category has been added.");
    }).catch((err) => {
        reject("Unable to create the category.")
    })
})
}
module.exports.deleteCategoryById = (index) => {
    return new Promise((resolve, reject) => {
    Category.destroy({
        where: {
            id: index
        }
    }).then((data) => {
        resolve(data);
    }).catch((err) => {
        reject("No Category was deleted.")
    })
})
}
module.exports.deletePostById = (index) => {
    return new Promise((resolve, reject) => {
    Post.destroy({
        where: {
            id: index
        }
    }).then((data) => {
        resolve(data);
    }).catch((err) => {
        reject("No Post was deleted.")
    })
})
}