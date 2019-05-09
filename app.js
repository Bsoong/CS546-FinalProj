const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const configRoutes = require("./routes");
const express_handlebars = require("express-handlebars");

configRoutes(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
