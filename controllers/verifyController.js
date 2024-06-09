const checkAdmin = require("../middleware/admin");
module.exports = [
  checkAdmin,
  (req, res, next) => {
    const action = req.body.action;
    const path = req.body.path;
    console.log("this is the action ", action, "this is the path", path);

    if (action && path) {
      const redirect = path + action;
      console.log(redirect);
      return res.redirect(`${path}/${action}`);
    } else {
      res.status(400);
      res.render("error", {
        title: "Bad Request ",
        message: "Invalid action or path.",
      });
    }
  },
];
