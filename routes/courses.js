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
    const course = await coureData.getCourseById(req.params.id);

    res.status(200).json(course);

  }
  catch(e){
    res.status(404);
  }
});
