const express = require("express");
const router = express.Router();
const data = require("../data");
const ratingData = data.ratings;

router.get("/:code", (req,res) => {
    console.log("Review" + req.params.code);
    res.render("./templates/review", {code: req.params.code});
});

router.post("/:code", async(req,res) => {
    const review = req.body;
    
});