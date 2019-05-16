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
            const user = await userData.getById(xss(req.session.user));
            let userReviews = user.ratings;
            let exist = false;
            for(let u = 0; u<userReviews.length; u++){
                let reviewId = userReviews[u];
                let review = await ratingData.get(reviewId.toString());
                if(review.courseCode==xss(req.params.code)){
                    exist=true;
                    break;
                }
            }
            if(!exist){
                res.render("templates/review", {verified: true, title: "RMC | Rate Course", code: xss(req.params.code), course: course});
            } else {
                res.render("templates/reviewPosted", {verified: true, title: "RMC | Review Exists", code: xss(req.params.code), alreadyPosted: true});
            }
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
            if(avg%1!=0){
                avg = avg.toFixed(1);
                avg = parseFloat(avg);
            }
            if(avg!=course.avgRating){
                await courseData.updateRating(course._id.toString(), avg);
            }
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
            let oldAvg = course.avgRating;
            let avg = course.avgRating;
            if(match.length!=0){                
                let totalRating = 0;
                for(let i = 0;i<match.length;i++){
                    let eachrate = match[i];
                    totalRating+=eachrate;
                }                
                avg = totalRating/match.length;
                if(avg%1!=0){
                    avg = avg.toFixed(1);
                    avg = parseFloat(avg);
                }
                if(avg!=course.avgRating){
                    await courseData.updateRating(course._id.toString(), avg);
                }
            } else {
                avg = -1;
                await courseData.updateRating(course._id.toString(), avg);                
            }
            let comments = toDelete.comments;
            for(let k = 0; k<comments.length; k++){
                await userData.deleteComment(comments[k].authorID.toString(), comments[k]._id.toString())
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

router.post("/edit-form/:id", async(req,res)=>{
    if(xss(req.session.authent)){
        res.redirect("/review/edit/"+xss(req.params.id));
    } else {
        req.session.login_fail = true;
        res.redirect("/login");
    }
});

router.get("/edit/:id", async(req,res)=>{
    if(xss(req.session.authent)){
        try{
            const editR = await ratingData.get(xss(req.params.id));
            const course = await courseData.getCourseByCode(editR.courseCode);
            res.render("templates/review", {verified:true, title: "RMC | Edit Review", review: editR, id: editR._id.toString(), course: course, code: editR.courseCode, edit:true});
        }catch(e){
            console.log(e)
            req.session.error = "There was an error in editing your review";
            res.redirect("/edit_fail");
        }
    } else {
        req.session.login_fail = true;
        res.redirect("/login");
    }
});

router.post("/edit/:id", async(req,res)=>{
    try{
        if(xss(req.session.authent)){
            const newReview = req.body;
            let rID = xss(req.params.id);
            const oldReview = await ratingData.get(rID);
            if(oldReview.rating!=newReview.rating){
                await ratingData.editRating(rID, +newReview.rating);
                const course = await courseData.getCourseByCode(oldReview.courseCode);
                const ratings = await ratingData.getAll();
                const match = [];
                for(let j = 0; j<ratings.length;j++){
                    let rr = ratings[j];
                    if(rr.courseCode==oldReview.courseCode){
                        match.push(rr.rating);
                    }
                }
                let totalRating = 0;
                for(let i = 0;i<match.length;i++){
                    let eachrate = match[i];
                    totalRating+=eachrate;
                }
                let avg = totalRating/match.length;
                if(avg%1!=0){
                    avg = avg.toFixed(1);
                    avg = parseFloat(avg);
                }
                await courseData.updateRating(course._id.toString(), avg);
            }
            if(typeof(newReview.tag)=="string"){
                let t = [];
                t.push(newReview.tag);
                newReview.tag = t;
            } else if(typeof(newReview.tag)==undefined){
                newReview.tag=[];
            }
            let o = oldReview.tags.sort().join(",");
            let n = newReview.tag.sort().join(",");
            if(!(o===n)){
                await ratingData.editTags(rID, newReview.tag)
            }          
            if(oldReview.review!=newReview.comment){
                let reviewComment = "";
                if(xss(newReview.comment)){
                    reviewComment = newReview.comment;
                }
                await ratingData.editReview(rID, reviewComment);
            }            
            if(newReview.professor!=oldReview.professor){
                await ratingData.editProfessor(rID, newReview.professor)
            }
            res.render("templates/reviewPosted", {verified:true, title: "RMC | Review Edited", posted: true});
        } else {
            req.session.login_fail = true;
            res.redirect("/login");
        }
    } catch(e){
        console.log(e);
        req.session.error = "Review could not be edited at this time.";
        res.redirect("/edit_fail");
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
