require('dotenv').config()
const express= require('express');
const router = express.Router();
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const randtoken = require('rand-token');
const jwt = require('jsonwebtoken')
const saltRounds = 10;
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'task_office'
})
router.post('/register', async (req, res) => {
    const {email,pass,firstName,lastName,mobile,address,passport,country,dateOfBirth} = req.body;
    // let fileType = image.filter(file => file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    if(validateEmail(email)){
        const query = `SELECT * FROM users WHERE email = '${email}'`
        connection.query(query,async (err,results) => {
            if(err) throw err;
            if(!results.length){
                let isVerified = false
                const hashedPass = await bcrypt.hash(pass, saltRounds)
                let genToken = randtoken.generate(16);
                const userQuery = `INSERT INTO users(email,pass, isVerified,token) VALUES("${email}","${hashedPass}","${isVerified}","${genToken}")`;
                const idQuery = `SELECT id FROM users WHERE email="${email}"`
                connection.query(userQuery,(err,results) => {
                    if(err) throw err;
                    connection.query(idQuery,(err,results) => {
                        const {id} = results[0]
                        const profileQuery = `INSERT INTO userprofile(userID,first_name,last_name,mobile,address,passport,country,date_of_birth) VALUES ("${id}","${firstName}","${lastName}","${mobile}","${address}","${passport}","${country}","${dateOfBirth}")`
                        connection.query(profileQuery,(err,results) => {
                            if(err) throw err;
                            res.json({message:`Profile created successfully, please check this token ${genToken} for verification`});
                        })
                    })
                })
            }
            else {
                res.json({message:"User already registered with the email address!"})
            }
        })
    } else{
        res.json({message:"Invalid email address"})
    }
})
router.get('/verify', async (req, res) => {
    const {verification} = req.headers
    const query = `SELECT isVerified FROM users WHERE token="${verification}"`
    connection.query(query,(err,results) => {
        if (err) throw err;
        const {isVerified} = results[0]
            if(isVerified === 'true'){
                res.json({message: 'Profile is already verified!'})
            }  else {
                const query = `UPDATE users SET isVerified="true" WHERE token="${verification}"`
                connection.query(query,(err,results) => {
                    if (err) throw err;
                    res.json({message:'Your profile is successfully verified'})
                })
            }
    })
})
router.post('/login', async (req, res) => {
    const {email,password} = req.body
    if(validateEmail(email)){
        const query = `SELECT * FROM users WHERE email="${email}"`;
        connection.query(query, (err,results) => {
            if (err) throw err;
            if(results.length){
                const userInfo = results[0]
                const hash = userInfo.pass
                const userEmail = userInfo.email
                if(userInfo.isVerified !== 'false'){
                    bcrypt.compare(password, hash,(err, result) => {
                        if(err) throw err;
                        if(result){
                            const {id,email} = userInfo
                            const payload = {
                                id,email
                            }
                            const token = jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET)
                            res.json({
                                message:`Authentication is successfull, use token`,
                                token:token
                            })
                            // res.redirect(`/userprofile/${id}`)
                        } else{
                            res.send('Authentication failed')
                        }
                    })
                } else{
                    res.json({message:'You need to verify your email first'})
                }
            } else {
                res.json({message:'You are not registered,please sign up first'})
            }
            
        })
    } else {
        res.json({message:'Invalid email address'})
    }
    
})
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

module.exports = router