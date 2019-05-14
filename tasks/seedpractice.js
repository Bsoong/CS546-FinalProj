//I pledge my honor that I have abided by the Stevens Honor System.
//Rachel Kim
const connection = require("../data/mongoConnection");
const data = require("../data/");
const courseData = data.courses;
const userData = data.users;
const ratingData = data.ratings;
const courseList = require("../data/courses.json");
const userList = require("../data/users.json");
const ratingList = require("../data/ratings.json");

const main = async () => {
    const d = await connection();
    
    d.dropDatabase();

    const db = await connection();

    for(let i = 0; i < courseList.length; i++){
        let currentCourse = courseList[i];
        await courseData.create(currentCourse.courseName, currentCourse.courseCode, currentCourse.professors, -1, currentCourse.description, currentCourse.credits, currentCourse.semester, currentCourse.classLevel, currentCourse.webSection);
    }

    for(let i = 0; i < userList.length; i++){
        let u = userList[i];
        await userData.createUser(u.firstName, u.lastName, u.email, u.password, u.gender, u.year, u.age);
    }

    const users = await userData.getAllUsers();

    for(let i=0; i<ratingList.length; i++){
        let r = ratingList[i];
        let person = Math.floor(Math.random()*users.length);
        let course = await courseData.getCourseByCode(r.courseCode);
        let p = Math.floor(Math.random()*course.professors.length);
        let professor=course.professors[p];        
        const rating = await ratingData.create(r.courseCode, professor, users[person]._id.toString(), r.datePosted, r.tags, r.rating, r.review);
        await userData.addReview(users[person]._id.toString(), rating._id.toString());
    }

    console.log("Done seeding database");

    db.serverConfig.close();
  
};
  
main().catch(error => {
    console.log(error);
});