const courseRoutes = require("./courses");
const ratingRoutes = require("./ratings")
const loginRoutes = require("./login")
const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const router = express.Router();
const bcrypt = require("bcrypt");
const app = express();
const userData = require("../data/users.js");
const courseData = require("../data/courses.js")
const saltRounds = 16;
const xss = require("xss");

const constructorMethod = app => {
  app.use(session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: true
  }));

  app.use(function(req, res, next) {
    let date = new Date().toUTCString();
    let method = req.method;
    let route = req.originalUrl;
    let authent = (req.session.authent)? "(Authenticated User)" : "(Non-authenticated User)";
    if(!(route.includes(".css"))&&!(route.includes(".js"))){
      console.log(`${date} ${method} ${route} ${authent}`);      
    }
    next();
  });

  app.use("/courses", courseRoutes);
  app.use("/review", ratingRoutes);
  app.use("/login", loginRoutes)
  app.use("/", router);
  app.use("*", (req, res) => {
    if(xss(req.session.authent)) {
      res.render("templates/error",{verified: true, title: "RMC | Error", hasErrors: true, error: "Page not found."});
    } else {
      res.render("templates/error",{verified: false, title: "RMC | Error", hasErrors: true, error: "Page not found."});
    }
  });
};

router.get("/",(req, res) => {
  if(xss(req.session.authent)) {
    res.render("templates/index", {
      verified: true, title: "RateMyCourse"
    });
  } else {
    res.render("templates/index", {
      verified: false, title: "RateMyCourse"
    });
  }
});

//Once Login is implemented with backend, need to change variable verified to true so that the myprofile page pops up in place of Login.
// router.get("/login", (req,res) => {
//   console.log("Login");
//   res.render("templates/login",{title: "RMC | Login"
// });


// router.get("/comment", (req,res) => {
//   console.log("Comments");
//   res.render("./templates/comment",{title: "RMC | "});
// });

router.get("/createAccount", (req,res) => {
  if(xss(!req.session.authent)) {
    res.render("./templates/createAcc",{verified: false, title: "RMC | Account Creation"});
  } else {
    res.redirect("/myProfile");
  }
});

router.get("/about", (req,res) => {
  if(xss(req.session.authent)) {
    res.render("./templates/about",{verified: true, title: "RMC | About Us"});
  } else {
    res.render("./templates/about",{verified: false, title: "RMC | About Us"});
  }
});

// router.get("/coursePage", async(req,res) => {
//   try {
//     console.log("CoursePage");
//     const courseCollection = await courseData.getAllCourses();
//     res.render("./templates/coursePage",{title: "RMC | Courses"});
//   } catch(e) {
//     console.log(e);
//   }
// });

router.get("/myProfile", (req,res) => {
  if(xss(req.session.authent)){
      res.render("templates/myprofile",{verified: true, title: "RMC | Profile", user: req.session.user});
  } else {
    res.redirect("/");
  }
});

router.get("/logout", (req,res) => {
  if(xss(req.session.authent)){
    req.session.destroy();
    res.render("templates/logout",{verified: false, title: "RMC | Logout"});
  } else {
    res.redirect("/");
  }
});

router.get("/posted", (req,res)=>{
  if(xss(req.session.authent) && xss(req.session.posted)){
    delete req.session.posted;
    res.render("templates/reviewPosted",{posted: true, verified: true, title: "RMC | Review Posted"});
  } else {
    if(req.session.authent) {
      res.render("templates/error",{verified: true, title: "RMC | Error", hasErrors: true, error: "Page not accessible."});
    } else {
      res.render("templates/error",{verified: false, title: "RMC | Error", hasErrors: true, error: "Page not accessible."});
    }
      // res.redirect("/");
  }
});

router.get("/post_fail", (req, res) => {
  if(xss(req.session.authent) && xss(req.session.post_fail)){
      delete req.session.post_fail;
      res.render("templates/error",{hasErrors: true, verified: true, title: "RMC | Error", error: "Sorry! There was a technical difficulty and your review could not be posted at this time."});
  } else {
    if(req.session.authent) {
      res.render("templates/error",{verified: true, title: "RMC | Error", hasErrors: true, error: "Page not accessible."});
    } else {
      res.render("templates/error",{verified: false, title: "RMC | Error", hasErrors: true, error: "Page not accessible."});
    }
      // res.redirect("/");
  }
});

// router.get("/courseInfo", (req,res) => {
//   if(req.session.authent){
//     res.render("./templates/courseInfo",{verified: true, title: "RMC | Course Info"});
//   } else {
//     res.render("./templates/courseInfo",{verified: false, title: "RMC | Course Info"});
//   }
// });

// router.post("/search", async (req, res) => {
//   try{
//     const courseCollection = await courseData.getAllCourses();
//     const body = xss(req.body.searchInput);
    
// //     for(let i = 0; i < courseCollection.length; i++){
// //       if(courseCollection[i].courseName == body || courseCollection[i].courseCode == body){
// //         const foundCourse = courseCollection[i];
// //         code = foundCourse.courseCode;
// //         res.redirect("/courses/code/"+code);
// //         // res.status(200).render("./templates/courseInfo", {course: foundCourse});
// //       }
// //       }
// //       // res.render("./templates/index", {
// //       //   errors2: true
// //       // });
//     }
//   catch(e){
//       res.status(400);
//   }
// });

router.post("/search", async (req, res) => {
  try{
    const courseCollection = await courseData.getAllCourses();
    const body = xss(req.body.searchInput);
    let courses = [];
    for(let i = 0; i < courseCollection.length; i++){
      let foundCourse = await courseCollection[i].courseName.includes(body) || courseCollection[i].courseCode.includes(body);
      if(foundCourse){
        await courses.push(courseCollection[i]);
      }
    }
    res.status(200).render("./templates/coursePage", {
      courses: courses
    });
    // for(let i = 0; i < courseCollection.length; i++){
    //   if(courseCollection[i].courseName == body || courseCollection[i].courseCode == body){
    //     const foundCourse = courseCollection[i];
    //     code = foundCourse.courseCode;
    //     res.redirect("/courses/code/"+code);
        // res.status(200).render("./templates/courseInfo", {course: foundCourse});
      // }
      // }
      // res.render("./templates/index", {
      //   errors2: true
      // });
    }
  catch(e){
      res.status(400);
  }
});


module.exports = constructorMethod;
