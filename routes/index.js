const courseRoutes = require("./courses");
const ratingRoutes = require("./ratings")
const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const router = express.Router();
const bcrypt = require("bcrypt");
const app = express();
const userData = require("../data/users.js");
const courseData = require("../data/courses.js")
const saltRounds = 16;

const constructorMethod = app => {
  app.use("/courses", courseRoutes);
  app.use("/review", ratingRoutes);
  app.use("/", router);
  // app.use("*", (req, res) => {
  //   res.render("./templates/index");
  // });
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

router.post("/search", async (req, res) => {
  try{
    const courseCollection = await courseData.getAllCourses();
    const body = req.body.searchInput;
    for(let i = 0; i < courseCollection.length; i++){
      if(courseCollection[i].courseName == body || courseCollection[i].courseCode == body){
        const foundCourse = courseCollection[i];
        res.status(200).render("./templates/courseInfo", {
          name: foundCourse.courseName,
          code: foundCourse.courseCode,
          credits: foundCourse.credits,
          professors: foundCourse.professors,
          level: foundCourse.classLevel,
          rating: foundCourse.avgRating,
          description: foundCourse.description,
          web: foundCourse.webSection
        });
      }
      }
      // res.render("./templates/index", {
      //   errors2: true
      // });
    }
  catch(e){
      res.status(400);
  }
});


module.exports = constructorMethod;
