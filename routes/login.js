const express = require("express");
const router = express.Router();

router.use(session({
  name: 'AuthCookie',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: true
}));

router.use(function(req, res, next) {
  let date = new Date().toUTCString();
  let method = req.method;
  let route = req.originalUrl;
  let authent = (req.session.authent)? "(Authenticated User)" : "(Non-authenticated User)";
  console.log(`${date} ${method}  ${route} ${authent}`);
  next();
});

router.use("/myprofile", function(req, res, next) {
  if(req.session.authent) {
    next();
  } else {
    res.status(403).send("Error: Users is not Logged in.");
  }
})

router.get("/", (req,res) => {
  if(req.session.authent) {
    res.render("templates/index", {
      verified: true
    });
  } else {
    res.render("templates/index", {
      verified: false
    });
  }
});

router.get("/login" , (req,res) => {
    res.render("templates/login")
});
//Once Login is implemented with backend, need to change variable verified to true so that the myprofile page pops up in place of Login.
router.post("/login",  async (req,res) => {
    let foundUser = null;
    let data = req.body;
    console.log(data.inputEmail)
    if(!data.inputEmail|| !data.inputPassword) {
      res.render("templates/login" , {
        errors: true
      });
      res.status(401);
      return;
    }
    for(i = 0; i < userData.length; i++) {
      let usernameChecker = data.username === userData[i].username;
      if(usernameChecker) {
        try {
          let passcheck = await bcrypt.compare(data.password, userData[i].hashedPassword)
          if(passcheck) {
            foundUser = userData[i];
            break;
          }
        } catch(e) {
          console.log("oops")
          return;
        }
      }
      }
      if(foundUser) {
        req.session.authent = true;
        req.session.id = foundUser.Uid;
        req.session.username = foundUser.username;
        req.session.firstName = foundUser.firstName;
        req.session.lastName = foundUser.lastName;
        req.session.profession = foundUser.profession;
        req.session.bio = foundUser.bio;
        res.redirect("/templates/index");
        return;
      } else {
        res.render("templates/login", {
          errors:true
        });
        return;
    }
  });

module.exports = router;
