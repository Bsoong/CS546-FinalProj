//I pledge my honor that I have abided by the Stevens Honor System.
//Rachel Kim
const connection = require("../data/mongoConnection");
const data = require("../data");
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
    const homeworkTags = ["Homework is easy", "Homework is hard", "Lots of homework", "Not a lot of homework", "Not a lot of homework"];
        const testTags = ["Tests are easy", "Tests are hard", "Frequent exams", "Pop quizzes"];
        const professorTags = ["Professor is interesting", "Professor is knowledgeable", "Professor is accessible"];
        const otherTags = ["Lectures are interesting", "Lectures are long", "Laptops allowed", "Attendance matters", "Class participation matters"];
    let person = 0;
    for(let i=0; i<ratingList.length; i++){
        let r = ratingList[i];
        if(person<users.length-1){
            person++;
        } else {
            person = 0;
        }
        // let person = Math.floor(Math.random()*users.length);
        let course = await courseData.getCourseByCode(r.courseCode);
        let p = Math.floor(Math.random()*course.professors.length);
        let professor=course.professors[p];
        let tags = [];
        let ht = Math.floor(Math.random()*homeworkTags.length);
        let tt = Math.floor(Math.random()*testTags.length);
        let pt = Math.floor(Math.random()*professorTags.length);
        let ot = Math.floor(Math.random()*otherTags.length);
        tags.push(homeworkTags[ht]);
        tags.push(testTags[tt]);
        tags.push(professorTags[pt]);
        tags.push(otherTags[ot]);
        const rating = await ratingData.create(r.courseCode, professor, users[person]._id.toString(), r.datePosted, tags, r.rating, r.review);
        await userData.addReview(users[person]._id.toString(), rating._id.toString());
    }
    const ratings = await ratingData.getAll();
    const courses = await courseData.getAllCourses();
    let courseRatings = [];
    for(let c = 0; c<courses.length;c++){
        courseRatings[c]=0;
        let count = 0;
            for(let j = 0; j<ratings.length;j++){
                let rr = ratings[j];
                if(rr.courseCode==courses[c].courseCode){
                    count++;
                    let add = courseRatings[c];
                    add+=rr.rating;
                    courseRatings[c] = add;
                }
            }
        if(count!=0){
            let newAverage = courseRatings[c]/count;
            if(newAverage%1!=0){
                newAverage = newAverage.toFixed(1);
                newAverage = parseFloat(newAverage);
            }
            await courseData.updateRating(courses[c]._id.toString(), newAverage);
        }   
    }

    console.log("Done seeding database");

    db.serverConfig.close();
  
};
  
main().catch(error => {
    console.log(error);
});
