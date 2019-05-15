const courseRoutes = require("./courses");
const ratingRoutes = require("./ratings");
const loginRoutes = require("./login");
const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const router = express.Router();
const bcrypt = require("bcrypt");
const app = express();
const userData = require("../data/users.js");
const courseData = require("../data/courses.js")
const ratingData = require("../data/ratings.js");
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
    if(!(route.includes(".css"))&&!(route.includes(".js"))&&!(route.includes(".ico"))){
      console.log(`${date} ${method} ${route} ${authent}`);
    }
    next();
  });

  app.use("/courses", courseRoutes);
  app.use("/review", ratingRoutes);
  app.use("/login", loginRoutes);
  app.use("/", router);
  app.use("*", (req, res) => {
    if(xss(req.session.authent)) {
      if(xss(req.session.error)){
        let message = xss(req.session.error);
        delete req.session.error;
        res.render("templates/error",{verified: true, title: "RMC | Error", hasErrors: true, error: message});
      } else {
        res.render("templates/error",{verified: true, title: "RMC | Error", hasErrors: true, error: "Page not found."});
      }
    } else {
      if(xss(req.session.error)){
        let message = xss(req.session.error);
        delete req.session.error;
        res.render("templates/error",{verified: false, title: "RMC | Error", hasErrors: true, error: message});
      } else {
        res.render("templates/error",{verified: false, title: "RMC | Error", hasErrors: true, error: "Page not found."});
      }
    }
  });
};

router.get("/", async(req, res) => {
  if(xss(req.session.authent)) {
    try{
      const ra = await ratingData.highestRating();
      const re = await ratingData.recentRating();
      res.render("templates/index", {verified: true, title: "RateMyCourse", ratings: ra, recent: re });
    } catch(e) {
      res.status(400);
    }
  }
  else{
    const ra = await ratingData.highestRating();
    const re = await ratingData.recentRating();
    res.render("templates/index", { verified: false, title: "RateMyCourse", ratings: ra, recent: re });
  }
});



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

router.get("/myProfile", async(req,res) => {
  if(xss(req.session.authent)){
    try {
      // let u = req.session.user;
      const u = await userData.getById(req.session.user.toString());
      let ratings = u.ratings;
      let r= [];
      for(let i = 0; i<ratings.length; i++){
        let reviewId = ratings[i];
        const review = await ratingData.get(reviewId.toString());
        r.push(review);
      }
      let comments = u.comments;
      let c = [];
      for(let j=0; j<comments.length; j++){
        let rID = comments[j].reviewID;
        const rev = await ratingData.get(rID.toString());
        let comment = comments[j];
        comment.courseCode = rev.courseCode;
        c.push(comment);
      }
      if(ratings.length==0){
        if(comments.length==0){
          res.render("templates/myprofile",{verified: true, title: "RMC | Profile", user: u, noratings: true, nocomments:true});
        } else {
          res.render("templates/myprofile",{verified: true, title: "RMC | Profile", user: u, noratings: true, comments: c});
        }
      } else {
        if(comments.length==0){
          res.render("templates/myprofile",{verified: true, title: "RMC | Profile", user: u, ratings: r, nocomments:true});
        } else {
          res.render("templates/myprofile",{verified: true, title: "RMC | Profile", user: u, ratings: r, comments: c});
        }
      }
    } catch(e){
      console.log(e);
      res.render("templates/error",{verified: true, title: "RMC | Error", hasErrors: true, error: "Issue opening page."});
    }
  } else {
    req.session.login_fail = true;
    res.redirect("/login");
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
  }
});

router.post("/search", async (req, res) => {
  try{
    const courseCollection = await courseData.getAllCourses();
    let body = xss(req.body.searchInput);
    body = body.toLowerCase();
    const courses = [];
    for(let i = 0; i < courseCollection.length; i++){
      let cn = courseCollection[i].courseName.toLowerCase();
      let cc = courseCollection[i].courseCode.toLowerCase();
      let desc = courseCollection[i].description.toLowerCase();
      let prof = courseCollection[i].professors;
      let professors = "";
      for(let p = 0; p<prof.length; p++){
        professors = professors.concat(prof[p].toLowerCase());
      }
      let foundCourse = false;
      let stype = xss(req.body.searchtype);
      if(stype=="name"){
        foundCourse = cn.includes(body);
      } else if(stype=="code"){
        foundCourse = cc.includes(body);
      } else if(stype=="desc"){
        foundCourse = desc.includes(body);
      } else if(stype=="prof"){
        foundCourse = professors.includes(body);
      } else {
        foundCourse = cn.includes(body) || cc.includes(body) || desc.includes(body) || professors.includes(body);
      }
      if(foundCourse){
        courses.push(courseCollection[i]);
      }
    }
    if(courses.length == 0){
      res.status(404).render("./templates/index", {
        errors2: true
      });
    }
    else{
      res.status(200).render("./templates/coursePage", {
        courses: courses
      });
    }
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
