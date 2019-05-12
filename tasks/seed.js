const dbConnection = require("../data/mongoConnection");
const data = require("../data/");
const courseData = data.courses;
const userData = data.users;
const courseList = require("../data/courses.json");
const userList = require("../data/users.json");

dbConnection().then(
  db => {
    return db
      .dropDatabase()
      .then(() => {
        return dbConnection;
      })
      .then(db => {
        for(let i = 0; i < courseList.length; i++){
          let currentCourse = courseList[i];
          courseData.create(currentCourse.courseName, currentCourse.courseCode, currentCourse.professors, currentCourse.avgRating, currentCourse.description, currentCourse.credits, currentCourse.classLevel, currentCourse.webSection);
        }
      })
      .then(db=>{
        for(let i = 0; i < userList.length; i++){
          let u = userList[i];
          userData.createUser(u.firstName, u.lastName, u.email, u.password, u.gender, u.year, u.age);
        }
      })
      .then(() => {
        console.log("Done seeding database");
        db.close();
      });
  },
  error => {
    console.error(error);
  }
);
