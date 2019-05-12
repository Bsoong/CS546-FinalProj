const express = require("express");
const router = express.Router();
const data = require("../data");
const ratingData = data.ratings;
const courseData = data.courses;
const userData = data.users;
const xss = require("xss");

router.get("/:code", async(req,res) => {
    try{
        if(xss(req.session.authent)){
            const course = await courseData.getCourseByCode(xss(req.params.code));
            if(course===undefined){
                throw "course not found";
            }
            res.render("templates/review", {verified: true, title: "RMC | Rate Course", code: xss(req.params.code), course: course});
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
    const person = await userData.getById(req.session.user);
    let errors = [];
    let reviewComment = "";
    if(xss(review.comment)){
        reviewComment = review.comment;
    }
    if(xss(!review.courseCode)){
        errors.push("Need to input Course Code");
    }
    if(xss(!review.rating)){
        errors.push("Need to give a rating");
    }
    try {
        const course = await courseData.getCourseByCode(xss(review.courseCode));
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
        const newReview = await ratingData.create(xss(review.courseCode), xss(person._id), formattedDate, review.tags, xss(review.rating), reviewComment);
        if(newReview!==undefined){
            const course = await courseData.getCourseByCode(xss(review.courseCode));
            await courseData.updateRating(course._id.toString());
            const u = await userData.addReview(xss(person._id), newReview._id.toString());
            if(u!==undefined){
                req.session.posted = true;
                res.redirect("/posted");
            }
        }       
    } catch(e){
        console.log(e);
        req.session.post_fail = true;
        res.redirect("/post_fail");
    }
});

module.exports = router;
