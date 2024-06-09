module.exports = (req, res, next) => {
  console.log("we are checking password");
  const { adminPassword } = req.body;
  if (adminPassword === process.env.ADMIN_PASSWORD) {
    return next();
  } else {
    console.log("Password denied");
    const error = new Error("Wrong Password was entered");
    error.status = 401;
    res.status(401);
    res.render("error", {
      message: "Access Denied.",
      status: 401,
      description: "Admin password was wrong",
    });
  }
};
