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
    const {email,pass,isVerified,token} = req.body;
    const query = `SELECT * FROM users WHERE email = '${email}'`
    connection.query(query,async (err,results) => {
        if(err) throw err;
        if(!results.length){
            const id = uuidv4()
            const hashedPass = await bcrypt.hash(pass, saltRounds)
            let genToken = randtoken.generate(16);
            const query = `INSERT INTO users(id,email,pass, isVerified,token) VALUES("${id}","${email}","${hashedPass}","${isVerified}","${genToken}")`;
            connection.query(query,(err,results) => {
            if(err) throw err;
            else res.send(`Registered! here is you token ${genToken}`)
        })
        }else {
            res.json({message:"User already registered with the email address!"})
        }
    })
    
})
router.get('/verify', async (req, res) => {
    const {verification} = req.headers
    const query = `UPDATE users SET isVerified="true" WHERE token="${verification}"`
    connection.query(query,(err,results) => {
        if (err) throw err;
        res.send(results.message)
    })
})
router.post('/login', async (req, res) => {
    const {email,password,id} = req.body
    console.log(email,password)
    const query = `SELECT * FROM users WHERE email="${email}"`;
    connection.query(query, (err,results) => {
        if (err) throw err;
        console.log(results)
        const userInfo = results[0]
        if(userInfo.isVerified !== 'false'){
            const hash = userInfo.pass
            bcrypt.compare(password, hash,(err, result) => {
                if(err) throw err;
                if(result){
                    const {id,email} = userInfo
                    const payload = {
                        id,email
                    }
                    const token = jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET)
                    res.send(`Authenticated Successfully here is your Token:${token}`)
                    // res.redirect(`/userprofile/${id}`)
                } else{
                    res.send('Authentication failed')
                }
            })
        }else{
            res.json({message:'You need to verify your email first'})
        }
    })
})

module.exports = router