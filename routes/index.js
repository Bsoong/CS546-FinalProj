const courseRoutes = require("./courses");

const constructorMethod = app => {
  app.use("/courses", courseRoutes);

  app.use("*", (req, res) => {
    res.render("./templates/index");
  });
};

module.exports = constructorMethod;
