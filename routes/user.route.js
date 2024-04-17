const userCtrl = require("../controller/user.controller");
const express = require("express");
const router = express.Router();
const {
  userSignupValidators,
  userLoginValidators,
  userVerifyValidators,
  userForgotValidators,
  userForgotResetValidators,
  userResetValidators,
  createUserValidators,
} = require("../middleware/user.middleware");
const auth = require("../config/auth");
const superAuth = require("../config/super-auth");

router.post("/signUp", userSignupValidators, userCtrl.signUp);
router.post(
  "/superAdminSignUp",
  userSignupValidators,
  userCtrl.superAdminSignUp
);
router.post("/loginUser", userLoginValidators, userCtrl.loginUser);
router.get("/fetchUsers", userCtrl.getAllUser);
router.get("/fetchUserById/:id", auth, userCtrl.getUserById);
router.post("/deleteUserById/:id", superAuth, userCtrl.deleteUserById);
router.post("/forgotPassword", userForgotValidators, userCtrl.forgotPassword);
router.post(
  "/resetForgotPassword",
  userForgotResetValidators,
  userCtrl.resetForgotPassword
);
router.post("/verification", userVerifyValidators, userCtrl.verifyEmail);
router.post(
  "/resetPassword",
  auth,
  userResetValidators,
  userCtrl.resetPassword
);
router.post("/updateStatusById/:id", superAuth, userCtrl.updateStatusById);
router.post("/updateUserById/:id", auth, userCtrl.updateUserById);
router.post("/createUser", userCtrl.createUser);

module.exports = router;
