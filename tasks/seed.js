const dbConnection = require("../data/mongoConnection");
const data = require("../data/");
const courseData = data.courses;
const userData = data.users;
const ratingData = data.ratings;
const courseList = require("../data/courses.json");
const userList = require("../data/users.json");
const ratingList = require("../data/ratings.json");

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
          courseData.create(currentCourse.courseName, currentCourse.courseCode, currentCourse.professors, -1, currentCourse.description, currentCourse.credits, currentCourse.classLevel, currentCourse.webSection);
        }
      })
      .then(db=>{
        for(let i = 0; i < userList.length; i++){
          let u = userList[i];
          userData.createUser(u.firstName, u.lastName, u.email, u.password, u.gender, u.year, u.age);
        }
      })
      // .then(db => {
      //   for(let i=0; i<ratingList.length; i++){
      //     let r = ratingList[i];
      //     const rating = ratingData.create(r.courseCode, allUsers[person]._id.toString(), r.datePosted, r.tags, r.rating, r.review);
      //     userData.addReview(allUsers[person]._id.toString(), rating._id.toString());
      //   }
      //})
      .then(() => {
        console.log("Done seeding database");
      });
  },
  error => {
    console.error(error);
  }
);
