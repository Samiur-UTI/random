const express= require('express');
const bodyParser = require('body-parser');
const loginRoute = require('./controllers/login')
const userRoute = require('./controllers/user')
const app = express();
const multer = require('multer');
const upload = multer({dest:'public/',limits:{size:1000000}});
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
app.use(upload.array('image',10))
// app.use(upload.fields('image'))
app.use(loginRoute)
app.use(userRoute);
app.listen(5000,() => {
    console.log('Server is running on port 5000');
})