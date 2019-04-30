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
            res.status(200).send('welcome to trackyo');
    }
}

const mysql = require('mysql2');
let config = {
    user: 'root',
    password: 'dbConnector',
    database: 'trackyoBlog',
    host: '35.240.17.235'
}
const connectionName = 'bilgindemo:europe-west1:database'
if(process.env.NODE_ENV === 'production'){
    config.socketPath = `/cloudsql/${connectionName}`;
}
let connection = mysql.createPool(config);

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const resultsNotFound = { 
    "errorCode": "0",
    "errorMessage": "İşlem başarısız",
    "rowCount": "0",
    "data": ""
}

const resultsFound = {
    "errorCode": "1",
    "errorMessage": "İşlem başarılı",
    "rowCount": "1",
    "data": ""
}

let createUser = (req,res)=>{
    connection.getConnection(function(err,connection){
        if(err) throw err;
        bcrypt.hash(req.body.inputPassword,saltRounds,function(err,hash){
            const sql = 'INSERT INTO users SET ?'; //sql query for process
            const values = {
                'email':req.body.inputEmail,
                'password': hash
            }
            connection.query(sql,values,function(error,results,fields){
                if(error){
                    resultsNotFound["errorMessage"] = "Bu email adresi zaten kayıtlı"
                    return res.send(resultsNotFound);
                }
                else{
                    return res.send(resultsFound);
                }
            })
            connection.release();
            if(err) throw err;
        })
    })
}
var email
let loginUser = (req,res)=>{
    connection.getConnection(function(err,connection){
        if(err) throw err;
        const sql = 'SELECT * FROM users WHERE `email`=?'; //sql query for process
        const values = [req.body.inputEmail];
        email = values[0];
        connection.query(sql,values,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "Sunucuda bir şeyler ters gitti";
                return res.send(resultsNotFound)
            }
            if(results == ""){
                resultsNotFound["errorMessage"] = "Böyle bir kullanıcı bulunamadı"
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
                    resultsNotFound["errorMessage"] = "Şifreniz yanlış"
                    return res.send(resultsNotFound);
                }
            });
            connection.release();
            if(error) throw error;
        });
    })
}

let changePassword = (req,res)=>{
    connection.getConnection(function(err,connection){
        if(err) throw err;
        bcrypt.hash(req.body.inputPassword,saltRounds,function(err,hash){
            const sql = 'UPDATE login SET password ? WHERE `userID` = ?'
            const values = {
                password: hash
            }
            connection.query(sql,values,function(error,results,fields){
                if(error){
                    resultsNotFound["errorMessage"] = "Şifreniz eski şifreniz olamaz"
                    return res.send(resultsNotFound);
                }
                else{
                    return res.send(resultsFound);
                }
            })
            connection.release();
            if(err) throw err;
        })
    })
}
let getPosts = (req,res)=>{
    connection.getConnection(function(req,res){
        if(err) throw err;
        const sql = 'SELECT * FROM posts';
        connection.query(sql,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "Sunucuda bir şeyler ters gitti";
                return res.send(resultsNotFound)
            }
            if(results == ''){
                resultsNotFound["errorMessage"] = "Post bulunamadı";
                return res.send(resultsNotFound);
            }
            else{
                return res.send(resultsFound);
            }
           
        })
        connection.release();
        if(err) throw err;
    })
}
let addPost = (req,res)=>{
    connection.getConnection(function(err,connection){
        if(err) throw err;
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
                resultsNotFound["errorMessage"] = "Sunucuda bir şeyler yanlış gitti."
                return res.send(resultsNotFound);
            }
            else{
                return res.send(resultsFound);
            }
        })
        connection.release();
        if(err) throw err;
    })
}
let getEvents = (req,res)=>{
    connection.getConnection(function(req,res){
        if(err) throw err;
        const sql = 'SELECT * FROM events';
        connection.query(sql,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "Sunucuda bir şeyler ters gitti";
                return res.send(resultsNotFound)
            }
            if(results == ''){
                resultsNotFound["errorMessage"] = "Etkinlik bulunamadı";
                return res.send(resultsNotFound);
            }
            else{
                return res.send(resultsFound);
            }
           
        })
        connection.release();
        if(err) throw err;
    })
}
let addEvent = (req,res) => {
    connection.getConnection(function(req,res){
        if(err) throw err;
        const sql = 'INSERT INTO events SET ?';
        const values = {
            eventName: req.body.eventName,
            eventContent: req.body.eventContent,
            eventDate: req.body.eventDate
        }
        connection.query(sql,values,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "Sunucuda bir şeyler yanlış gitti."
                return res.send(resultsNotFound);
            }
            else{
                return res.send(resultsFound);
            }
        })
        connection.release();
        if(err) throw err;
    })
}
let getDate = function(){
    return ((new Date()).toLocaleDateString());
}
let getUserID = (req,res) => {
    connection.getConnection(function(req,res){
        if(err) throw err;
        const sql = 'SELECT `userID` FROM users WHERE `email` = ?'
        const values = email;
        connection.query(sql,values,function(error,results,fields){
            if(error){
                resultsNotFound["errorMessage"] = "Sunucuda bir şeyler yanlış gitti"
                return res.send(resultsNotFound);
            }
            else{
                return res.send(resultsFound);
            }
        })
        connection.release();
        if(err) throw err;
    })
}