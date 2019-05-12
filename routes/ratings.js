const express = require("express");
const router = express.Router();
const data = require("../data");
const ratingData = data.ratings;
const courseData = data.courses;

router.get("/:code", async(req,res) => {
    try{
        if(req.session.authent){
            const course = await courseData.getCourseByCode(req.params.code);
            if(course===undefined){
                throw "course not found";
            }
            res.render("templates/review", {verified: true, title: "RMC | Rate Course", code: req.params.code, course: course});
        } else {
            res.redirect("/");
        }   
    } catch(e){
        res.redirect("/");
        // if(req.session.authent){
        //     res.render("templates/review", {verified: true, title: "RMC | Rate Course"})
        // }
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
        if(course===undefined){
            throw "course not found";
        }
    } catch(e){
        errors.push("Not a valid course code.");
    }
    if(errors.length>0){
        res.render("templates/review", {
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
        const newReview = await ratingData.create(review.courseCode, person._id, formattedDate, review.tags, review.rating, reviewComment);
        req.session.posted = true;
        res.redirect("/posted");
    } catch(e){
        console.log(e);
        req.session.post_fail = true;
        res.redirect("/post_fail");        
    }
});

module.exports = router;
