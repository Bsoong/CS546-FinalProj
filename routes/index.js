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
  res.render('templates/index');
});

//Once Login is implemented with backend, need to change variable verified to true so that the myprofile page pops up in place of Login.
router.get("/login", (req,res) => {
  console.log("Login");
  res.render("templates/login");
});
//Once Login is implemented with backend, need to verify authenticated user to let them post.
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
<<<<<<< HEAD
});

router.get("/coursePage", (req,res) => {
  try {
    console.log("CoursePage");
    res.render("./templates/coursePage");
  } catch(e) {
    console.log(e);
  }
});

router.get("/myProfile", (req,res) => {
  try {
    console.log("myProfile");
    res.render("templates/myprofile");
  } catch(e) {
    console.log(e);
  }
});

router.get("/logout", (req,res) => {
  //  req.session.destroy();
    res.render("templates/logout");
    return;
})

router.get("/courseInfo", (req,res) => {
  try {
    console.log("CourseInfo");
    res.render("./templates/courseInfo");
  } catch(e) {
    console.log(e);
  }
});

=======

})

>>>>>>> e629e257bbe1553043c08d5883beb451548c4804

module.exports = constructorMethod;
