const express = require("express");
const apiRouter = express.Router();
const destinationList = require("../otherData/flagAndCountryList.json");
//Import Routing Files
let User = require("../routes/user.route.js");

// set routes with server
apiRouter.use("/user", User);


apiRouter.get("/fetchDestinations", (req, res) => {
  res.status(200).json({ data: destinationList });
});
module.exports = apiRouter;
