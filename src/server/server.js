const projectData = {};
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const cors = require("cors");
app.use(cors());
app.use(express.static('dist'));


const port = 8080;
const server = app.listen(port, () => { console.log(`running on localhost ${port}`) });



app.post("/Post", (req, res) => {
    console.log(req.body);
    projectData.city = req.body.city;
    projectData.country = req.body.country;
    projectData.date = req.body.date;
    projectData.temp = req.body.temp;
    projectData.sky = req.body.sky;


    res.send(projectData);
})


app.get("/all", getData);

function getData(req, res) {
    console.log(projectData)
    res.send(projectData);
}

module.exports = projectData