const express = require("express");
const router = express.Router();
const data = require("../data");
const ratingData = data.ratings;
const courseData = data.courses;

router.get("/:code", async(req,res) => {
    try{
        // let code = +req.params.code;
        if(req.session.authent){
            const course = await courseData.getCourseByCode(req.params.code);
            if(course===undefined){
                console.log(req.params.code);
                throw "course not found";
            }
            res.render("templates/review", {verified: true, title: "RMC | Rate Course", code: req.params.code, course: course});
        } else {
            res.redirect("/");
        }   
    } catch(e){
        console.log(e);
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
    // try {
    //     const course = await courseData.getCourseByCode(review.courseCode);
    //     if(course===undefined){
    //         throw "course not found";
    //     }
    // } catch(e){
    //     errors.push("Not a valid course code.");
    // }
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
    const newReview = await ratingData.create(review.courseCode, person._id, formattedDate, review.tags, review.rating, reviewComment);
    res.redirect("/review/posted");
    // try {
        
    // } catch(e){
    //     console.log(e);
    //     res.redirect("/review/post_fail");        
    // }
});

router.get("/posted", (res,req)=>{
    if(req.session.authent){
        res.render("templates/reviewPosted",{posted: true, verified: true, title: "RMC | Review Posted"});
    } else {
        res.redirect("/");
    }
});

router.get("/post_fail", (res, req) => {
    if(req.session.authent){
        res.render("templates/error",{hasErrors: true, verified: true, title: "RMC | Error", error: "Sorry! There was a technical difficulty and your review could not be posted at this time."});
    } else {
        res.redirect("/");
    }
});

module.exports = router;
