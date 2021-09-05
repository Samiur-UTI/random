const express= require('express');
const router = express.Router();
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
var randtoken = require('rand-token');
const saltRounds = 10;
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'task_office'
})
router.post('/register', async (req, res) => {
    const {email,pass,isVerified,token} = req.body;
    const id = uuidv4()
    const hashedPass = await bcrypt.hash(pass, saltRounds)
    let genToken = randtoken.generate(16);
    const query = `INSERT INTO users(id,email,pass, isVerified,token) VALUES("${id}","${email}","${hashedPass}","${isVerified}","${genToken}")`;
    connection.query(query,(err,results) => {
        if(err) throw err;
        else res.send(`Registered! here is you token ${genToken}`)
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
    const {email,password} = req.body
    const query = `SELECT pass FROM users WHERE email="${email}"`;
    connection.query(query, (err,results) => {
        if (err) throw err;
        const hash = results[0].pass
        console.log(hash,password)
        bcrypt.compare(password, hash,(err, result) => {
            if(err) throw err;
            console.log(result)
            if(result){
                res.send('Authenticated successfully')
            } else{
                res.send('Authentication failed')
            }
        })
    })
})
module.exports = router