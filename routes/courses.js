const express = require("express");
const router = express.Router();
const data = require("../data");
const courseData = data.courses;

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
    res.status(404);
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

router.post("/", async(req, res) => {
  try{
    const data = req.body;
    const newCourse = await courseData.create(data.courseName, data.courseCode, data.professors, data.avgRating, data.description, data.credits, data.classLevel, data.webSection);
    res.status(200).json(newCourse);
    console.log(typeof(data.webSection));
  }
  catch(e){
    res.status(400);
    console.log(e);
  }
});


module.exports = router;
