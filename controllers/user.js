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
router.get('/userprofile',tokenAuth, async (req, res,next) => {
    const {id} = req.user
    const query = `SELECT * FROM userprofile WHERE userID = "${id}"`
    connection.query(query,(err,results)=>{
            if (err) throw err;
            console.log(results)
            if(results.length){
                res.status(200).json(results[0])
            }
            else {
                res.send('Create your profile to see the results')
            }
    })  
})
// router.post('/userprofile/:id/create',tokenAuth, async (req, res, next)=>{
//     const {id} = req.user
//     if(id === req.params.id){
//         const query = `SELECT * FROM userprofile WHERE id="${id}"`
//         connection.query(query,(err,results)=>{
//             if(err) throw err;
//             if(!results.length){
//                 const image = req.files
//                 console.log('Before filter',image)
//                 let fileType = image.filter(file => file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
//                 console.log('After filter',fileType.length)
//                 if(fileType.length){
//                     const body = JSON.parse(JSON.stringify(req.body))
//                     const {firstName,lastName,mobile,address,dateOfBirth,passport,country} = body
//                     let filenames = []
//                     image.forEach((image) => (filenames.push(image.filename)))
//                     const query = `INSERT INTO userprofile(id,first_name,last_name,mobile_num,address,date_of_birth,passport,country,image) 
//                                     VALUES("${id}","${firstName}","${lastName}","${mobile}","${address}","${dateOfBirth}","${passport}","${country}","${filenames}")`
//                     connection.query(query,(err,results,fields) => {
//                         if (err) throw err;
//                         res.status(201).send('Profile created successfully')
//                     })
//                 }else{
//                     res.json({message:'Invalid file type sent, only jpeg and png files are supported'})
//                 }
                
//             } else{
//                 res.json({message: 'Cannot create more than one profile with the specified userID'})
//             }
//         }) 
//     } else{
//         res.status(203).send('you are not authorized to view this')
//     }   
// })
router.delete('/userprofile/delete',tokenAuth, async (req, res, next) => {
    const {id} = req.user
    const query = `SELECT * FROM users WHERE id = ${id}`
    connection.query(query,(err,results)=>{
        if(results.length){
            const query = `DELETE FROM userprofile WHERE userID="${id}"`
            connection.query(query,(err,results,fields) => {
                if(err) throw err;
                else {
                    const query = `DELETE FROM users WHERE id="${id}"`
                    connection.query(query,(err,results,fields) => {
                        res.status(200).send('Profile info deleted')
                    })
                }
            })
        } else res.json({message:'No profile found'})
    })
})
router.patch('/userprofile/update',tokenAuth, async (req, res, next) => {
    const {id} = req.user
    const query = `SELECT * FROM userprofile WHERE userID="${id}"`
    connection.query(query,(err,results,fields) => {
            if(err) throw err;
            if(results.length){
                const image = req.files
                let fileType = image.filter(file => file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
                console.log('After filter',fileType.length)
                if(fileType.length){
                    let filenames = []
                    image.forEach((image) => (filenames.push(image.filename)))
                    console.log(filenames)
                    const {firstName,lastName,mobile,address,dateOfBirth,passport,country} = req.body
                    console.log(req.body)
                    const query = `UPDATE userprofile SET first_name="${firstName}", last_name="${lastName}",mobile="${mobile}",address="${address}",date_of_birth="${dateOfBirth}",passport="${passport}",country="${country}",image="${filenames}" WHERE userID="${id}"`
                    connection.query(query,(err,results,fields) => {
                        if (err) throw err;
                        else res.status(201).send('Profile updated successfully')
                    })
                } else res.json({message:'Invalid file uploaded, only jpeg and PNG files are supported'})
            } else{
                res.json({message:'No profile found to update'})
            }
    })
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