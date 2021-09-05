require('dotenv').config()
const express= require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'task_office'
})
router.get('/userprofile/:id',tokenAuth, async (req, res,next) => {
    const {id} = req.user
    console.log(id,req.user)
    if(id === req.params.id){
        const query = `SELECT * FROM userprofile WHERE id = "${id}"`
        connection.query(query,(err,results)=>{
            if (err) throw err;
            console.log(results)
            if(results.length){
                res.status(200).send(results[0])
            }
            else {
                res.send('Create your profile to see the results')
            }
        })
    } else{
        res.status(203).send('you are not authorized to view this')
    }   
})
router.post('/userprofile/:id/create',tokenAuth, async (req, res, next)=>{
    const {id} = req.user
    if(id === req.params.id){
        const image = req.file
        const body = JSON.parse(JSON.stringify(req.body))
        const {filename} = image
        const {firstName,lastName,mobile,address,dateOfBirth,passport,country} = body
        const query = `INSERT INTO userprofile(id,first_name,last_name,mobile_num,address,date_of_birth,passport,country,image) 
                        VALUES("${id}","${firstName}","${lastName}","${mobile}","${address}","${dateOfBirth}","${passport}","${country}","${filename}")`
        connection.query(query,(err,results,fields) => {
            if (err) throw err;
            res.status(201).send('Profile created successfully')
        })
    }
})

function tokenAuth(req,res,next){
    const authHeader = req.headers['authorization']
    if (!authHeader){
        res.status(401).send(`Invalid authorization`)
    }
    const token = authHeader && authHeader.split(' ')[1]
    console.log(token)
    if(token){
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,result) => {
            if(err) {
                res.status(401).send(`Invalid authorization`)
                throw err;
            }
            req.user = result
            next()
        })
    }
    else{
        res.status(403).send('INTRUDERR!!')
    }
}

module.exports = router;