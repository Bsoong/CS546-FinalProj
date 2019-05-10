const express = require("express");
const router = express.Router();
const cData = require("../data");
const courseData = cData.courses;
const injectCourses = require("../data/courses.json");

router.get("/", async(req, res) => {
  try{
    const courseCollection = await courseData.getAllCourses();
    res.status(200).json(courseCollection);
  }
  catch(e){
    res.status(404);
  }
});

router.get("/:id", async(req, res) => {
  try{
    const course = await courseData.getCourseById(req.params.id);
    res.status(200).json(course);

  }
  catch(e){
    res.status(404).json({ error: "Error: could not find animal."});
  }
});

router.get("/code/:code", async(req, res) => {
  try{
    const course = await courseData.getCourseByCode(req.params.code);

    res.status(200).json(course);
  }
  catch(e)
{
  res.status(404);
}});

// router.post("/", async(req, res) => {
//   try{
//     for(let i = 0; i < injectCourses.length; i++){
//       let currentCourse = injectCourses[i];
//       let newCourse = await courseData.create(currentCourse.courseName, currentCourse.courseCode, currentCourse.professors, currentCourse.avgRating, currentCourse.description, currentCourse.credits, currentCourse.classLevel, currentCourse.webSection);
//       res.json(newCourse);
//     }
//     res.status(200);
//   }
//   catch(e){
//     res.status(400);
//     console.log(e);
//   }
// });

router.post("/", async(req, res) => {
  try{
    const body = req.body;
    console.log(body);
  }
  catch(e){
    res.status(400).json({ error: "Error: something shat itself"})
  }
});

router.delete("/:id", async(req, res) => {
  try{
    const courseId = req.params.id;
    const remove = await courseData.removeCourse(courseId);
  }
  catch(e){
    res.status(400);
    console.log(e);
  }
});




module.exports = router;
