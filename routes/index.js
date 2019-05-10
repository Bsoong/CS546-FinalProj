const courseRoutes = require("./courses");
const express = require("express");
const session = require('express-session');
const router = express.Router();
const bcrypt = require("bcrypt");
const app = express();
const userData = require("./../users.js");
const saltRounds = 16;

const constructorMethod = app => {
  app.use("/courses", courseRoutes);
  app.use("/", router);
  app.use("*", (req, res) => {
    res.render("./templates/index");
  });
};

router.get("/",(req, res) => {
  console.log('Home');
  res.render('./templates/index');
});

router.get("/login", (req,res) => {
  console.log("Login");
  res.render("./templates/login");
});

router.get("/review", (req,res) => {
  console.log("Review");
  res.render("./templates/review");
})

router.get("/comment", (req,res) => {
  console.log("Comments");
  res.render("./templates/comment");
});

router.get("/createAccount", (req,res) => {
  console.log("Comments");
  res.render("./templates/createAcc");
});

router.get("/about", (req,res) => {
  console.log("About");
  res.render("./templates/about");

})


module.exports = constructorMethod;
