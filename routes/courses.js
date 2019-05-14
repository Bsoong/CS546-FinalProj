const express = require("express");
const router = express.Router();
const cData = require("../data");
const courseData = cData.courses;
const ratingData = cData.ratings;
const userData = cData.users;
const injectCourses = require("../data/courses.json");
const xss = require("xss");

router.get("/", async(req,res) => {
  try {
    const courseCollection = await courseData.getAllCourses();
    if(xss(req.session.authent)){
      res.render("./templates/coursePage",{verified: true, title: "RMC | Courses", courses: courseCollection});
    } else {
      res.render("./templates/coursePage",{verified: false, title: "RMC | Courses", courses: courseCollection});
    }
  } catch(e) {
    console.log(e);
  }
});

// router.get("/:id", async(req, res) => {
//   try{
//     const course = await courseData.getCourseById(req.params.id);
//     res.status(200).json(course);

//   }
//   catch(e){
//     res.status(404).json({ error: "Error: could not find animal."});
//   }
// });

router.get("/code/:code", async(req, res) => {
  try {
    const course = await courseData.getCourseByCode(xss(req.params.code));
    const ratinglist = await ratingData.getAll();
    const ratings = [];
    for(let i = 0; i<ratinglist.length; i++){
      let r = ratinglist[i];
      if(r.courseCode==course.courseCode){
        const u = await userData.getById(r.author.toString());
        let name = u.firstName + " " + u.lastName;
        r.authorName = name;
        ratings.push(r);
      }
    }
    if(xss(req.session.authent)){
      if(course.avgRating<0){
        res.render("templates/courseInfo",{verified: true, title: xss(req.params.code), course: course, review: ratings});
      } else {
        res.render("templates/courseInfo",{verified: true, title: xss(req.params.code), rating: true, course: course, review: ratings});
      }
    } else {
      if(course.avgRating<0){
        res.render("templates/courseInfo",{verified: false, title: xss(req.params.code), course: course, review: ratings});
      } else {
        res.render("templates/courseInfo",{verified: false, title: xss(req.params.code), rating: true, course: course, review: ratings});
      }
    }
  }
  catch(e){
    res.status(404);
  }
});

// router.post("/", async(req, res) => {
//   try{
//     for(let i = 0; i < injectCourses.length; i++){
//       let currentCourse = injectCourses[i];
//       let newCourse = await courseData.create(currentCourse.courseName, currentCourse.courseCode, currentCourse.professors, currentCourse.avgRating, currentCourse.description, currentCourse.credits, currentCourse.semester, currentCourse.classLevel, currentCourse.webSection);
//       res.json(newCourse);
//     }
//     res.status(200);
//   }
//   catch(e){
//     res.status(400);
//     console.log(e);
//   }
// });

router.delete("/:id", async(req, res) => {
  try{
    const courseId = xss(req.params.id);
    const remove = await courseData.removeCourse(courseId);
  }
  catch(e){
    res.status(400);
    console.log(e);
  }
});

module.exports = router;
