//a simple example for cloud functions
exports.restApi = (req,res) => {
    const path = req.path;
    switch(path){
        case '/signup':
            createUser(req,res);
            break;
        case '/login':
            loginUser(req,res);
            break;
        case 'changePassword':
            changePassword(req,res);
            break;
        case 'getPosts':
            getPosts(req,res);
            break;
        case '/addPost':
            addPost(req,res);
            break;
        case '/getEvents':
            getEvents(req,res);
            break;
        case '/addEvent':
            addEvent(req,res);
            break;
        default:
            res.status(200).send('Hello World!');
    }
}

const mysql = require('mysql2');
let config = {
    user: 'xxx',
    password: 'xxx',
    database: 'xxx',
    host: 'xxx'
}
const connectionName = 'xxx:europe-west1:xxx'
if(process.env.NODE_ENV === 'production'){
    config.socketPath = `/cloudsql/${connectionName}`;
}
let connection = mysql.createPool(config);

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const resultsNotFound = { 
    "errorCode": "0",
    "errorMessage": "operation failed",
    "rowCount": "0",
    "data": ""
}

const resultsFound = {
    "errorCode": "1",
    "errorMessage": "operation succeed",
    "rowCount": "1",
    "data": ""
}

let createUser = (req,res)=>{
    connection.getConnection(function(err,connection){
        bcrypt.hash(req.body.inputPassword,saltRounds,function(err,hash){
            const sql = 'INSERT INTO users SET ?'; //sql query for process
            const values = {
                'email':req.body.inputEmail,
                'password': hash
            }
            connection.query(sql,values,function(error,results,fields){
                if(error){
                    resultsNotFound["errorMessage"] = "this email is already registered."
                    return res.send(resultsNotFound);
                }
                else{
                    return res.send(resultsFound);
                }
            })
            connection.release();
        })
    })
}
var email
let loginUser = (req,res)=>{
    connection.getConnection(function(err,connection){
        const sql = 'SELECT * FROM users WHERE `email`=?'; //sql query for process
        const values = [req.body.inputEmail];
        email = values[0];
        connection.query(sql,values,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "An error occured";
                return res.send(resultsNotFound)
            }
            if(results == ""){
                resultsNotFound["errorMessage"] = "There is no user like that."
                return res.send(resultsNotFound)
            }
            bcrypt.compare(req.body.inputPassword, results[0].password, function(err,result){
                if(result==true){
                    const token = {
                        "token": jwt.sign(
                            {
                                email: req.body.inputEmail
                            },
                            process.env.JWT_SECRET,
                            { expiresIn: '30d' }
                        )
                    }
                    resultsFound["data"] = token;
                    res.send(resultsFound);
                }
                else{
                    resultsNotFound["errorMessage"] = "Incorrect Password"
                    return res.send(resultsNotFound);
                }
            });
            connection.release();
        });
    })
}

let changePassword = (req,res)=>{
    connection.getConnection(function(err,connection){
        bcrypt.hash(req.body.inputPassword,saltRounds,function(err,hash){
            const sql = 'UPDATE login SET password ? WHERE `userID` = ?'
            const values = {
                password: hash
            }
            connection.query(sql,values,function(error,results,fields){
                if(error){
                    resultsNotFound["errorMessage"] = "Your new password is cannot be your old password"
                    return res.send(resultsNotFound);
                }
                else{
                    return res.send(resultsFound);
                }
            })
            connection.release();
        })
    })
}
let getPosts = (req,res)=>{
    connection.getConnection(function(req,res){
        const sql = 'SELECT * FROM posts';
        connection.query(sql,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "An error occured";
                return res.send(resultsNotFound)
            }
            if(results == ''){
                resultsNotFound["errorMessage"] = "Post doesn't exist.";
                return res.send(resultsNotFound);
            }
            else{
                return res.send(resultsFound);
            }
           
        })
        connection.release();
    })
}
let addPost = (req,res)=>{
    connection.getConnection(function(err,connection){
        const sql = 'INSERT INTO post SET ?'; //sql query for process
        const values = {
            postTitle: req.body.postTitle,
            postBody: req.body.postBody,
            postCreatedAt: getDate,
            addedBy: getUserID,
            postCover: '',
        }
        connection.query(sql,values,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "An error occured."
                return res.send(resultsNotFound);
            }
            else{
                return res.send(resultsFound);
            }
        })
        connection.release();
    })
}
let getEvents = (req,res)=>{
    connection.getConnection(function(req,res){
        const sql = 'SELECT * FROM events';
        connection.query(sql,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "An error occured";
                return res.send(resultsNotFound)
            }
            if(results == ''){
                resultsNotFound["errorMessage"] = "Event doesn't exist";
                return res.send(resultsNotFound);
            }
            else{
                return res.send(resultsFound);
            }
           
        })
        connection.release();
    })
}
let addEvent = (req,res) => {
    connection.getConnection(function(req,res){
        const sql = 'INSERT INTO events SET ?';
        const values = {
            eventName: req.body.eventName,
            eventContent: req.body.eventContent,
            eventDate: req.body.eventDate
        }
        connection.query(sql,values,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "An error occured."
                return res.send(resultsNotFound);
            }
            else{
                return res.send(resultsFound);
            }
        })
        connection.release();
    })
}
let getDate = function(){
    return ((new Date()).toLocaleDateString());
}
let getUserID = (req,res) => {
    connection.getConnection(function(req,res){
        const sql = 'SELECT `userID` FROM users WHERE `email` = ?'
        const values = email;
        connection.query(sql,values,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "An error occured"
                return res.send(resultsNotFound);
            }
            else{
                return res.send(resultsFound);
            }
        })
        connection.release();
    })
}
