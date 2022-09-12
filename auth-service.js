var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcryptjs = require('bcryptjs');
const dotenv = require("dotenv")
dotenv.config()

var userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        dateTime: Date,
        userAgent: String
    }]
});

let User;

module.exports.initialize = () => {
    return new Promise ((resolve, reject) => {
        let db = mongoose.createConnection(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@senecaweb.w86xujy.mongodb.net/?retryWrites=true&w=majority`)
    
        db.on('error', (err) => {
            reject(err);
        })
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match!");
        } else {
            bcryptjs.hash(userData.password,10).then((hash) => {
                userData.password = hash;
                let newUser = new User(userData)
                newUser.save((err) => {
                if (err) {
                    if(err.code == 11000) {
                        reject("User Name already taken")
                    } else {
                        reject("There was an error creating the user: "+err)
                    }
                } else {
                    resolve();
                };
            });
            }).catch((err) => {
                reject("There is an error with password encryption: "+err);
            })
        };
    });
};

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName})
        .exec()
        .then((users) => {
            if (users.length == 0) {
                reject ("Unable to find user: "+userData.userName);
            } else {
                bcryptjs.compare(userData.password, users[0].password).then((result) => {
                    if (result === true) {
                        users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent})
                        
                        User.updateOne(
                            {username: users[0].userName},
                            {$set: {loginHistory: users[0].loginHistory}}
                        )
                        .exec()
                        .then(() => {
                            resolve(users[0])
                        }).catch((err) => {
                            reject("There was an error verifying the user: "+err)
                        })
    
                    } else {
                        reject ("Incorrect Password for user: "+userData.userName)
                    }
                }).catch((error) => {
                    reject ("Unable to decrypt password!");
                })
                
            }
        })
        .catch((error) => {
            reject("Unable to find user: "+userData.userName);
        })
    })
}

