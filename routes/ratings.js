const express = require("express");
const router = express.Router();
const data = require("../data");
const ratingData = data.ratings;
const userData = data.users;
const courseData = data.courses;

router.get("/:code", async(req,res) => {
    console.log("Review" + req.params.code);
    res.render("./templates/review", {title: "RMC | Rate Course", code: req.params.code});
});

router.post("/:code", async(req,res) => {
    const review = req.body;
    const person = req.session.user;
    let errors = [];
    let reviewComment = "";
    if(review.comment){
        reviewComment = review.comment;
    }
    if(!review.courseCode){
        errors.push("Need to input Course Code");
    }
    if(!review.rating){
        errors.push("Need to give a rating");
    }
    try {
        const course = await courseData.getCourseByCode(review.courseCode);
    } catch(e){
        errors.push("Not a valid course code.");
    }
    if(errors.length>0){
        res.render("./templates/review", {
            errors: errors,
            hasErrors: true,
            review: review,
            code: review.courseCode,
            title: "RMC | Rate Course"
        });
        return;
    }
    let date = new Date();
    let formattedDate = date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear();
    
    try {
        const newReview = await ratingData.create(review.courseCode, person._id, formattedDate, review.tags, reviewComment);
        res.render("/templates/reviewPosted",{posted: true, title: "RMC | Review Posted"});
    } catch (e){
        res.render("/templates/reviewPosted",{hasErrors: true, title: "RMC | Review Posted"});
    }
});

module.exports = router;