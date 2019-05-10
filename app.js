const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");
const static = express.static(__dirname + "/public");
const configRoutes = require("./routes");
const express_handlebars = require("express-handlebars");
const router = express.Router();
const userData = require("./data/users");
const saltRounds = 16;

app.use('/public', static);
//set static to pubic folder
app.use(bodyParser.json());
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

configRoutes(app);
app.engine("handlebars", express_handlebars({
  defaultLayout: "./main" ,
  partialsDir:"./views/templates/partials",
  }));
app.set("view engine", "handlebars");


app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will now be running on http://localhost:3000");
});



//I pledge my honor that I have abided by the Stevens Honor System
