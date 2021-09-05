require('dotenv').config()
const express= require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken')

router.get('/userprofile/:id',tokenAuth, async (req, res,next) => {
    const user = await req.user
    const {email} = user
    res.send(`User with email ${email} you have acces to your profile`)
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
            if(err) throw err;
            req.user = result
            next()
        })
    }
    else{
        res.status(403).send('INTRUDERR!!')
    }
}

module.exports = router;