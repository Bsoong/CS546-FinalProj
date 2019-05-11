const express = require("express");
const router = express.Router();
const data = require("../data");
const ratingData = data.ratings;
const courseData = data.courses;

router.get("/:code", async(req,res) => {
    if(req.session.authent){
        const course = await courseData.getCourseByCode(req.params.code);
        res.render("templates/review", {verified: true, title: "RMC | Rate Course", code: req.params.code, course: course});
    } else {
        res.redirect("/");
    }    
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
        res.render("/templates/review", {
            errors: errors,
            hasErrors: true,
            review: review,
            code: review.courseCode,
            title: "RMC | Rate Course",
            verified: true
        });
        return;
    }
    let date = new Date();
    let formattedDate = date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear();
    try {
        const newReview = await ratingData.create(review.courseCode, person._id, formattedDate, review.tags, reviewComment);
        res.redirect("/posted");
    } catch (e){
        res.redirect("/post_fail");        
    }
});

router.get("/posted", (res,req)=>{
    if(req.session.authent){
        res.render("/templates/reviewPosted",{posted: true, verified: true, title: "RMC | Review Posted"});
    } else {
        res.redirect("/");
    }
});

router.get("/post_fail", (res, req) => {
    if(req.session.authent){
        res.render("/templates/reviewPosted",{hasErrors: true, verified: true, title: "RMC | Review Posted"});
    } else {
        res.redirect("/");
    }
});

module.exports = router;
