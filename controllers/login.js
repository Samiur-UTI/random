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
module.exports = router