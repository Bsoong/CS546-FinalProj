const express = require("express");
const router = express.Router();
const session = require('express-session');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const saltRounds = 16;
const data = require("../data");
const userData = data.users;

//Confused on how to impllement this with login. 


router.use("/myprofile", function(req, res, next) {
  if(req.session.authent) {

    next();
  } else {
    res.status(403).send("Error: User is not Logged in.");
  }
});

router.get("/", (req,res) => {
  res.render("templates/login",{title: "RMC | Login"});
});

// router.get("/", (req,res) => {
//   if(req.session.authent) {
//     res.render("templates/index", {
//       verified: true
//     });
//   } else {
//     res.render("templates/index", {
//       verified: false
//     });
//   }
// });

//Once Login is implemented with backend, need to change variable verified to true so that the myprofile page pops up in place of Login.
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
        if(user.email == form.inputEmail){
            match = await bcrypt.compare(form.inputPassword, user.hashedPassword);
            if(match){
                req.session.authent = true;
                req.session.user = user;
                delete req.session.user.hashedPassword
                res.redirect("/");
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
    try {
      const newUser = await userData.createUser(form.firstName, form.lastName, form.emailInput, form.passwordInput, form.Gender, form.yearInput, form.ageInput);
      res.render("/templates/index",{title: RateMyCourse})
    } catch(e){
      console.log(e);
      res.render("/templates/index",{title: RateMyCourse})
    }   
});

module.exports = router;