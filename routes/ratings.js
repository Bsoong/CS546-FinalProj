const express = require("express");
const router = express.Router();
const data = require("../data");
const ratingData = data.ratings;
const courseData = data.courses;
const userData = data.users;
const xss = require("xss");

router.get("/course/:code", async(req,res) => {
    try{
        if(xss(req.session.authent)){
            const course = await courseData.getCourseByCode(xss(req.params.code));
            if(course===undefined){
                throw "course not found";
            }
            res.render("templates/review", {verified: true, title: "RMC | Rate Course", code: xss(req.params.code), course: course});
        } else {
            req.session.login_fail = true;
            res.redirect("/login");
        }
    } catch(e){
        req.session.error = "An error occured while getting this page.";
        res.redirect("/");
    }
});

router.post("/course/:code", async(req,res) => {
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
    if(xss(!review.professor)){
        errors.push("Need to indicate a professor");
    }
    if(typeof(review.tag)=="string"){
        let t = [];
        t.push(review.tag);
        review.tag = t;
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
            verified: true,
            course: review
        });
        return;
    }
    let date = new Date();
    let formattedDate = date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear();
    try {
        const newReview = await ratingData.create(xss(review.courseCode), xss(review.professor), xss(person._id), formattedDate, review.tag, xss(review.rating), reviewComment);
        if(newReview!==undefined){
            const ratings = await ratingData.getAll();
            const match = [];
            for(let j = 0; j<ratings.length;j++){
                let rr = ratings[j];
                if(rr.courseCode==review.courseCode){
                    match.push(rr.rating);
                }
            }
            const course = await courseData.getCourseByCode(xss(review.courseCode));
            let avg = course.avgRating;
            let totalRating = 0;
            for(let i = 0;i<match.length;i++){
                let eachrate = match[i];
                totalRating+=eachrate;
            }
            avg = totalRating/match.length;
            await courseData.updateRating(course._id.toString(), avg);
            // if(match.length==0){
            //     await courseData.updateRating(course._id.toString(), newReview.rating);
            // } else {
            //     match.push(newReview.rating);

            // }
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

router.post("/delete/:id", async(req,res)=>{
    try{
        if(xss(req.session.authent)){
            let userId = xss(req.session.user);
            let id = xss(req.params.id);
            const deletedReviewId = await userData.removeReview(userId, id);
            const toDelete = await ratingData.get(id);
            await ratingData.remove(id);
            const ratings = await ratingData.getAll();
            const match = [];
            for(let j = 0; j<ratings.length;j++){
                let rr = ratings[j];
                if(rr.courseCode==toDelete.courseCode){
                    match.push(rr.rating);
                }
            }
            const course = await courseData.getCourseByCode(xss(toDelete.courseCode));
            let avg = course.avgRating;
            if(match.length!=0){                
                let totalRating = 0;
                for(let i = 0;i<match.length;i++){
                    let eachrate = match[i];
                    totalRating+=eachrate;
                }                
                avg = totalRating/match.length;
                await courseData.updateRating(course._id.toString(), avg);
            } else {
                avg = -1;
                await courseData.updateRating(course._id.toString(), avg);                
            }            
            // res.redirect("/myProfile");
            res.render("templates/reviewPosted", {verified: true, title: "RMC | Review Deleted", deleted: true});
        } else {
            req.session.login_fail = true;
            res.redirect("/login");
        }
    } catch(e){
        console.log(e);
        req.session.error = "An error occured while getting this page.";
        res.redirect("/deletion_fail");
    }
});

router.post("/comment/:rID", async(req,res) => {
    let info = req.body;
    let posteeID = xss(req.session.user);
    let date = new Date();
    let formattedDate = date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear();
    //add comment to review
    try{
        const author = await userData.getById(posteeID);
        let name = author.firstName + " " + author.lastName;
        const newComment = await ratingData.addComment(info.reviewID, posteeID, name, formattedDate, info.comment);
        const userComment = await userData.addComment(posteeID, newComment);
        res.render("templates/partials/commentsPartials", {layout:false, ...newComment});
    } catch(e){
        console.log(e);
        res.send("Could not post comment. Error: " + e + ".");
    }
});

router.post("/delete-comment/:id", async(req,res)=>{
    try{
        if(xss(req.session.authent)){
            let userId = xss(req.session.user);
            let id = xss(req.params.id);
            const duser = await userData.deleteComment(userId, id);
            const drating = await ratingData.deleteComment(duser.reviewID, id);
            res.render("templates/reviewPosted", {verified: true, title: "RMC | Comment Deleted", comment: true});
        } else {
            req.session.login_fail = true;
            res.redirect("/login");
        }
    } catch(e){
        console.log(e);
        req.session.error = "An error occured while getting this page.";
        res.redirect("/deletion_fail");
    }
});

module.exports = router;
