const courseRoutes = require("./courses");
const ratingRoutes = require("./ratings")
const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require("bcrypt");
const app = express();
const saltRounds = 16;

const constructorMethod = app => {
  app.use("/courses", courseRoutes);
  app.use("/review", ratingRoutes);
  app.use("/", router);
  // app.use("*", (req, res) => {
  //   res.render("./templates/index");
  // });
};

router.use(session({
  name: 'AuthCookie',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: true
}));

router.use(function(req, res, next) {
  let date = new Date().toUTCString();
  let method = req.method;
  let route = req.originalUrl;
  let authent = (req.session.authent)? "(Authenticated User)" : "(Non-authenticated User)";
  console.log(`${date} ${method}  ${route} ${authent}`);
  next();
});

router.use("/myprofile", function(req, res, next) {
  if(req.session.authent) {
    next();
  } else {
    res.status(403).send("Error: Users is not Logged in.");
  }
})

router.get("/", (req,res) => {
  if(req.session.authent) {
    res.render("templates/index", {
      verified: true
    });
  } else {
    res.render("templates/index", {
      verified: false
    });
  }
});

router.get("/login" , (req,res) => {
    res.render("templates/login")
});
//Once Login is implemented with backend, need to change variable verified to true so that the myprofile page pops up in place of Login.
router.post("/login",  async (req,res) => {
    let foundUser = null;
    let data = req.body;
    console.log(data.inputEmail)
    if(!data.inputEmail|| !data.inputPassword) {
      res.render("templates/login" , {
        errors: true
      });
      res.status(401);
      return;
    }
    for(i = 0; i < userData.length; i++) {
      let usernameChecker = data.username === userData[i].username;
      if(usernameChecker) {
        try {
          let passcheck = await bcrypt.compare(data.password, userData[i].hashedPassword)
          if(passcheck) {
            foundUser = userData[i];
            break;
          }
        } catch(e) {
          console.log("oops")
          return;
        }
      }
      }
      if(foundUser) {
        req.session.authent = true;
        req.session.id = foundUser.Uid;
        req.session.username = foundUser.username;
        req.session.firstName = foundUser.firstName;
        req.session.lastName = foundUser.lastName;
        req.session.profession = foundUser.profession;
        req.session.bio = foundUser.bio;
        res.redirect("/templates/index");
        return;
      } else {
        res.render("templates/login", {
          errors:true
        });
        return;
    }
  });
//Once Login is implemented with backend, need to verify authenticated user to let them post.
router.get("/review", (req,res) => {
  if(req.session.authent) {
    res.render("templates/review");
  } else {
    res.render("/login");
  }
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
          web: foundCourse.webSection
        });
      }
    }
  }
  catch(e){
    throw "Error, problem with searching."
    console.log(e);
  }
});


module.exports = constructorMethod;
