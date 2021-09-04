const express= require('express');
const bodyParser = require('body-parser');
const loginRoute = require('./controllers/login')
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
app.use(loginRoute)

app.listen(5000,() => {
    console.log('Server is running on port 5000');
})