const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const data = require("../data");
const userData = data.users;
const xss = require("xss")

router.get("/", (req,res) => {
  if(xss(req.session.authent)){
    res.redirect("/myProfile");
  } else {
    if(xss(req.session.login_fail)){
      delete req.session.login_fail;
      res.render("templates/login",{verified: false, error: "Error: You need to be logged in to make a review.", title: "RMC | Login"});
    } else {
      res.render("templates/login",{verified: false, title: "RMC | Login"});
    }
  }
});

router.post("/",  async (req,res) => {
  let form = req.body;
  try{
  if(!form.inputEmail || !form.inputPassword){
    res.render("templates/login" , {
          errors: true
        });
  } else {
    let match = false;
    let users = await userData.getAllUsers();
    for(let i=0;i<users.length;i++){
        let user = users[i];
        if(user.email == xss(form.inputEmail)){
            match = await bcrypt.compare(xss(form.inputPassword), xss(user.hashedPassword));
            if(match){
                req.session.authent = true;
                req.session.user = user._id;
                res.redirect("/myProfile");
                break;
            }
        }
    }
    if(!match){
      res.render("templates/login" , {
        errors: true
      });
    }
}} catch(e){
  res.render("templates/login" , {
    errors: true
  });
}
});

router.post("/newAccount", async(req,res) => {
    let form = req.body;
    let exist = false;
    try {
      const users = await userData.getAllUsers();
      for(let i=0;i<users.length;i++){
        let user = users[i];
        if(user.email == xss(form.emailInput)){
            exist = true;
            break;
        }
      }
      if(exist){
        res.render("./templates/createAcc",{verified: false, hasErrors: true, title: "RMC | Account Creation"});
      } else {
        const newUser = await userData.createUser(xss(form.firstName), xss(form.lastName),xss(form.emailInput), xss(form.passwordInput), xss(form.Gender), xss(form.yearInput), xss(form.ageInput));
        req.session.authent = true;
        req.session.user = newUser._id;
        res.redirect("/myProfile");
      }
    } catch(e){
      console.log(e);
      res.redirect("/");
    }
});

module.exports = router;
