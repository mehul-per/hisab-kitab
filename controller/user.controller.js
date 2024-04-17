const USER_COLLECTION = require("../module/user.module");
const CONSTANT = require("../common/constant");
const commonService = require("../common/common");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { StreamChat } = require("stream-chat");

/*
Method: POST
Topic: sign up api 
*/
exports.signUp = async (req, res) => {
  const { mode, password, email, name } = req.body;
  try {
    const errors = validationResult(req).array();
    if (errors && errors.length > 0) {
      let messArr = errors.map((a) => a.msg);
      return res.status(400).send({
        message: messArr.join(", "),
      });
    } else {
      USER_COLLECTION.findOne({
        email: email,
        isDeleted: false,
      }).then(async (user) => {
        if (user) {
          return res.status(409).json({
            message: CONSTANT.MESSAGE.USER_EXIST,
          });
        } else {
          const newPassword =
            mode == CONSTANT.COMMON.MANUAL
              ? await commonService.encryptPWD(password)
              : "";
          const isEmailVerified = mode == CONSTANT.COMMON.MANUAL ? false : true;
          const status =
            mode != CONSTANT.COMMON.MANUAL
              ? CONSTANT.ACTIVE
              : CONSTANT.DEACTIVE;
          let userObj = {
            ...req.body,
            password: newPassword,
            isEmailVerified: isEmailVerified,
            status: status,
          };
          USER_COLLECTION.create(userObj)
            .then((result) => {
              if (mode == CONSTANT.COMMON.MANUAL) {
                const templateData = {
                  username: name,
                };
                result["subject"] = CONSTANT.MESSAGE.VERIFICATION_MAIL;
                sendEmail(result, templateData, (response) => {
                  if (response["status"] === CONSTANT.FAIL) {
                    return res.status(400).send({
                      message:
                        CONSTANT.COLLECTION.USER +
                        CONSTANT.MESSAGE.REGISTER_SUCCESSFULLY,
                    });
                  } else {
                    return res.status(200).send({
                      message:
                        CONSTANT.COLLECTION.USER +
                        CONSTANT.MESSAGE.REGISTER_SUCCESSFULLY +
                        CONSTANT.MESSAGE.SENT_MAIL,
                    });
                  }
                });
              } else {
                const tokenPayload = {
                  name: result.name,
                  email: result.email,
                  phoneNo: result.phoneNo,
                  role: result.role,
                  userId: result._id,
                  deviceType: req.body.deviceType,
                  deviceToken: req.body.deviceToken,
                  address: result.address || {},
                };
                const token = jwt.sign(tokenPayload, process.env.superSecret, {
                  expiresIn: 86400,
                });
                return res.status(200).send({
                  message: CONSTANT.MESSAGE.LOGIN_SUCCESSFULLY,
                  token: token,
                  user_id: result._id,
                });
              }
            })
            .catch((err) => {
              return res.status(500).send({
                message: err.message || CONSTANT.MESSAGE.ERROR_OCCURRED,
              });
            });
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ message: CONSTANT.MESSAGE.SOMETHING_WRONG });
  }
};

/*
Method: POST
Topic: super-admin sign up api 
*/
exports.superAdminSignUp = async (req, res) => {
  const { mode, password, email } = req.body;
  // Set default values
  const status = CONSTANT.ACTIVE;
  const role = CONSTANT.COMMON.SUPER_ADMIN;
  const isEmailVerified = CONSTANT.TRUE;
  try {
    const errors = validationResult(req).array();
    if (errors && errors.length > 0) {
      let messArr = errors.map((a) => a.msg);
      return res.status(400).send({
        message: CONSTANT.MESSAGE.REQUIRED_FIELDS_MISSING,
        error: messArr.join(", "),
      });
    } else {
      USER_COLLECTION.findOne({
        email: email,
        isDeleted: false,
      }).then(async (user) => {
        if (user) {
          return res.status(409).json({
            message: CONSTANT.MESSAGE.USER_EXIST,
          });
        } else {
          const newPassword =
            mode == CONSTANT.COMMON.MANUAL
              ? await commonService.encryptPWD(password)
              : "";
          let userObj = {
            ...req.body,
            password: newPassword,
            status: status,
            role: role,
            isEmailVerified: isEmailVerified,
          };
          USER_COLLECTION.create(userObj);
          if (mode == CONSTANT.COMMON.MANUAL) {
            return res.status(200).send({
              message:
                CONSTANT.COLLECTION.USER +
                CONSTANT.MESSAGE.REGISTER_SUCCESSFULLY,
            });
          } else {
            const token = jwt.sign(userObj, process.env.superSecret, {
              expiresIn: 86400,
            });
            return res.status(200).send({
              message: CONSTANT.MESSAGE.LOGIN_SUCCESSFULLY,
              token: token,
            });
          }
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ message: CONSTANT.MESSAGE.SOMETHING_WRONG });
  }
};

/*
Method: POST
Todo: login User
*/
exports.loginUser = (req, res) => {
  try {
    const errors = validationResult(req).array();
    if (errors && errors.length > 0) {
      let messArr = errors.map((a) => a.msg);
      return res.status(400).send({
        message: CONSTANT.MESSAGE.REQUIRED_FIELDS_MISSING,
        error: messArr.join(", "),
      });
    } else {
      let { mode, email, password } = req.body;
      USER_COLLECTION.findOne({
        email: email.toLowerCase(),
        isDeleted: false,
        role: {
          $in: [...CONSTANT.ROLE_LIST],
        },
      })
        .then(async (user) => {
          if (user) {
            if (user.status === CONSTANT.ACTIVE) {
              if (mode === CONSTANT.COMMON.MANUAL) {
                const decryptedPassword = await commonService.decryptPWD(
                  user.password
                );
                if (password === decryptedPassword) {
                  let userObj = {
                    name: user.name,
                    email: user.email,
                    phoneNo: user.phoneNo,
                    role: user.role,
                    deviceType: req.body.deviceType,
                    deviceToken: req.body.deviceToken,
                    userId: user._id,
                    address: user.address || {},
                  };
                  const token = jwt.sign(userObj, process.env.superSecret, {
                    expiresIn: 86400,
                  });
                  return res.status(200).send({
                    message: CONSTANT.MESSAGE.LOGIN_SUCCESSFULLY,
                    token: token,
                    user_id: user._id,
                  });
                } else {
                  return res.status(403).send({
                    message: CONSTANT.MESSAGE.PASSWORD_INVALID,
                  });
                }
              } else {
                let userObj = {
                  name: user.name,
                  email: user.email,
                  phoneNo: user.phoneNo,
                  role: user.role,
                  userId: user._id,
                  deviceType: req.body.deviceType,
                  deviceToken: req.body.deviceToken,
                  address: user.address || {},
                };
                const token = jwt.sign(userObj, process.env.superSecret, {
                  expiresIn: 86400,
                });
                return res.status(200).send({
                  message: CONSTANT.MESSAGE.LOGIN_SUCCESSFULLY,
                  token: token,
                  user_id: user._id,
                });
              }
            } else {
              return res.status(403).send({
                message: CONSTANT.MESSAGE.NOT_ACTIVE_USER,
              });
            }
          } else if (!user && mode !== CONSTANT.COMMON.MANUAL) {

            let tokenPayload = {
              ...req.body,
              isEmailVerified: true,
              status: CONSTANT.ACTIVE,
            };
            USER_COLLECTION.create(tokenPayload)
              .then((result) => {
                tokenPayload.userId = result._id;
                const token = jwt.sign(tokenPayload, process.env.superSecret, {
                  expiresIn: 86400,
                });
                return res.status(200).send({
                  message: CONSTANT.MESSAGE.LOGIN_SUCCESSFULLY,
                  token: token,
                  user_id: result._id,
                });
              })
              .catch((err) => {
                return res.status(500).send({
                  message: err.message || CONSTANT.MESSAGE.ERROR_OCCURRED,
                });
              });
          } else {
            return res.status(403).send({
              message: CONSTANT.MESSAGE.USER_NOT_FOUND,
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            message: err.message || CONSTANT.MESSAGE.ERROR_OCCURRED,
          });
        });
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message || CONSTANT.MESSAGE.ERROR_OCCURRED,
    });
  }
};

/*
TYPE: POST
DETAILS: to verify OTP for reset password
*/
exports.verifyEmail = (req, res) => {
  const { otp, email } = req.body;

  try {
    USER_COLLECTION.findOne({ OTP: otp, email: email }).then((otpObj) => {
      if (!otpObj) {
        return res.status(401).send({
          message: CONSTANT.MESSAGE.OTP_INVALID,
        });
      } else if (otpObj.OTP === otp) {
        USER_COLLECTION.findOne({ email: email }).then((userObj) => {
          if (!userObj) {
            return res.status(401).send({
              message: CONSTANT.MESSAGE.USER_NOT_FOUND,
            });
          } else {
            let updateFields = { isEmailVerified: CONSTANT.TRUE };
            if (userObj.role === CONSTANT.COMMON.CUSTOMER) {
              updateFields.status = CONSTANT.ACTIVE;
            } else {
              updateFields.status = CONSTANT.DEACTIVE;
            }
            const newOTP = commonService.generateOTP();
            USER_COLLECTION.findOneAndUpdate(
              { email: email },
              { $set: updateFields, OTP: newOTP },
              { new: true }
            )
              .then((result) => {
                createUser(result, (error, user) => {
                  return res.status(200).send({
                    message:
                      CONSTANT.COLLECTION.USER +
                      CONSTANT.MESSAGE.EMAIL_VERIFIED,
                  });
                });
              })
              .catch((err) => {
                return res.status(500).send({ message: err.message });
              });
          }
        });
      } else {
        return res.status(401).send({
          message: CONSTANT.MESSAGE.OTP_INVALID,
        });
      }
    });
  } catch (err) {
    res.status(500).json({ message: CONSTANT.MESSAGE.SOMETHING_WRONG });
  }
};

/*
Method: POST
Topic: forgot password
*/
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    USER_COLLECTION.findOne({
      email: email,
      isDeleted: false,
    }).then(async (user) => {
      if (!user) {
        return res.status(400).json({
          message: CONSTANT.MESSAGE.EMAIL_INVALID,
        });
      } else {
        user["subject"] = CONSTANT.MESSAGE.FORGOT_PASSWORD_MAIL;
        const templateData = {
          username: user.name,
        };

        sendEmail(user, templateData, (response) => {
          if (response["status"] === CONSTANT.FAIL) {
            return res.status(500).send({
              message: CONSTANT.MESSAGE.SOMETHING_WRONG,
            });
          } else {
            return res.status(200).send({
              message: CONSTANT.MESSAGE.FORGOT_MAIL,
            });
          }
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      message: CONSTANT.MESSAGE.SOMETHING_WRONG,
      err: err.message,
    });
  }
};

/*
Method: POST
Topic: reset forgot password
*/
exports.resetForgotPassword = async (req, res) => {
  const { password, confirmPassword, otp, email } = req.body;
  try {
    USER_COLLECTION.findOne({
      OTP: otp,
      email: email,
    }).then(async (otpObj) => {
      if (!otpObj) {
        return res.status(401).send({
          message: CONSTANT.MESSAGE.OTP_INVALID,
        });
      } else if (otpObj.OTP === otp) {
        if (password !== confirmPassword) {
          return res.status(403).send({
            message: CONSTANT.MESSAGE.PASSWORD_MISMATCH,
          });
        }
        const encryptedPassword = await commonService.encryptPWD(password);
        const newOTP = commonService.generateOTP();
        USER_COLLECTION.findOneAndUpdate(
          { email: email },
          { $set: { password: encryptedPassword, OTP: newOTP } },
          { new: true }
        )
          .then(() => {
            return res.status(200).send({
              message:
                CONSTANT.COMMON.PASSWORD + CONSTANT.MESSAGE.SET_SUCCESSFULLY,
            });
          })
          .catch((err) => {
            return res.status(500).send({ message: err.message });
          });
      }
    });
  } catch (err) {
    res.status(500).json({
      message: CONSTANT.MESSAGE.SOMETHING_WRONG,
      err: err.message,
    });
  }
};

/*
Method: POST
Topic: reset password
*/
exports.resetPassword = async (req, res) => {
  const { newPassword, confirmPassword, email } = req.body;

  try {
    const user = await USER_COLLECTION.findOne({ email: email });
    if (!user) {
      return res.status(401).send({
        message: CONSTANT.MESSAGE.USER_NOT_FOUND,
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(403).send({
        message: CONSTANT.MESSAGE.PASSWORD_MISMATCH,
      });
    }
    const encryptedPassword = await commonService.encryptPWD(newPassword);
    user.password = encryptedPassword;
    await user.save();
    return res.status(200).send({
      message: CONSTANT.COMMON.PASSWORD + CONSTANT.MESSAGE.SET_SUCCESSFULLY,
    });
  } catch (err) {
    res.status(500).json({
      message: CONSTANT.MESSAGE.SOMETHING_WRONG,
    });
  }
};

/*
Method: GET
Todo: get all users
*/
exports.getAllUser = async (req, res) => {
  let query = {
    isDeleted: false,
  }
  try {
    const count = await USER_COLLECTION.countDocuments(query);
    const users = await USER_COLLECTION.find(query)
    if (users.length > 0) {
      res.status(200).json({
        message: CONSTANT.COLLECTION.USER + CONSTANT.MESSAGE.DATA_FOUND,
        totalRecords: count,
        status: 200,
        data: users,
      });
    } else {
      res.status(404).json({
        message: CONSTANT.MESSAGE.DATA_NOT_FOUND,
      });
    }
  }
  catch (err) {
    res
      .status(500)
      .json({ message: CONSTANT.MESSAGE.SOMETHING_WRONG, err: err.message });
  }
};

/*
Method: GET
Todo: get user by id
*/
exports.getUserById = (req, res) => {
  let query = { isDeleted: false };
  const Id = req.params.id;
  try {
    if (!commonService.isValidObjId(Id)) {
      return res.status(403).send({
        message: CONSTANT.MESSAGE.INVALID_ID,
      });
    } else {
      query["_id"] = { $in: [Id] };
      USER_COLLECTION.findOne(query).then((user) => {
        if (user) {
          res.status(200).send({
            message: CONSTANT.MESSAGE.DATA_FOUND,
            data: user,
          });
        } else {
          return res.status(403).send({
            message: CONSTANT.MESSAGE.DATA_NOT_FOUND,
          });
        }
      });
    }
  } catch (err) {
    res.status(500).json({
      message: CONSTANT.MESSAGE.SOMETHING_WRONG,
      err: err.message,
    });
  }
};

/*
Method: POST
Todo: update Payment
*/
exports.updateUserById = async (req, res) => {
  const Id = req.params.id;
  const isValid = commonService.isValidObjId(Id);
  try {
    if (!isValid) {
      return res.status(200).send({
        message: CONSTANT.MESSAGE.INVALID_ID,
      });
    } else {
      const { email, ...updatedFields } = req.body;
      const result = await USER_COLLECTION.findByIdAndUpdate(
        Id,
        { ...updatedFields },
        { new: true }
      );
      if (!result) {
        return res.json({
          message: CONSTANT.COLLECTION.USER + CONSTANT.MESSAGE.NOT_FOUND,
        });
      } else {
        res.status(200).json({
          message:
            CONSTANT.COLLECTION.USER + CONSTANT.MESSAGE.UPDATED_SUCCESSFULLY,
          data: result,
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      message: CONSTANT.MESSAGE.SOMETHING_WRONG,
      err: err.message,
    });
  }
};

/*
TODO: POST
Topic: update status 
*/
exports.updateStatusById = (req, res) => {
  let query = { isDeleted: false };
  const Id = req.params.id;
  const { status } = req.body;

  try {
    let updateFields = {};
    if (status && CONSTANT.STATUS_LIST.includes(status)) {
      updateFields.status = status;
    }
    USER_COLLECTION.findOneAndUpdate(
      { _id: Id, ...query },
      { $set: updateFields },
      { new: true }
    )
      .then((result) => {
        if (!result) {
          return res.status(404).send({
            message: CONSTANT.MESSAGE.USER_NOT_FOUND,
          });
        } else {
          const templateData = {
            username: result.name,
          };

          sendStatusEmail(result, templateData, (response) => {
            if (response["status"] === CONSTANT.FAIL) {
              return res.status(400).send({
                message:
                  CONSTANT.COLLECTION.USER + CONSTANT.MESSAGE.EMAIL_INVALID,
              });
            } else {
              return res.status(200).send({
                message: CONSTANT.MESSAGE.EMAIL_SENT_SUCCESSFULLY,
              });
            }
          });
        }
        return res.status(200).send({
          message:
            CONSTANT.COLLECTION.USER +
            CONSTANT.MESSAGE.STATUS_UPDATED_SUCCESSFULLY,
          user: result,
        });
      })
      .catch((err) => {
        return res.status(500).send({
          message: CONSTANT.MESSAGE.SOMETHING_WRONG,
          err: CONSTANT.MESSAGE.INVALID_ID,
        });
      });
  } catch (err) {
    res.status(500).json({
      message: CONSTANT.MESSAGE.SOMETHING_WRONG,
      err: err.message,
    });
  }
};

/*
TODO: POST
Topic: delete user by id
*/
exports.deleteUserById = (req, res) => {
  const Id = req.params.id;
  try {
    if (!commonService.isValidObjId(Id)) {
      return res.status(403).send({
        message: CONSTANT.MESSAGE.INVALID_ID,
      });
    } else {
      USER_COLLECTION.findOne({ _id: Id, isDeleted: false }).then((user) => {
        if (!user) {
          return res.status(403).send({
            message: CONSTANT.MESSAGE.USER_NOT_FOUND,
          });
        } else {
          USER_COLLECTION.findByIdAndUpdate(
            Id,
            { $set: { isDeleted: true } },
            { new: true }
          )
            .then(async (result) => {
              res.status(200).json({
                message:
                  CONSTANT.COLLECTION.USER +
                  CONSTANT.MESSAGE.DELETED_SUCCESSFULLY,
              });
            })
            .catch((err) => {
              return res.status(500).send({ message: err.message });
            });
        }
      });
    }
  } catch (err) {
    res.status(404).json({
      message: CONSTANT.MESSAGE.SOMETHING_WRONG,
      err: err.message,
    });
  }
};

/*
TODO: POST
Topic: create user 
*/
exports.createUser = async (req, res) => {
  const { email, name } = req.body;
  try {
    const errors = validationResult(req).array();
    if (errors && errors.length > 0) {
      let messArr = errors.map((a) => a.msg);
      return res.status(400).send({
        message: CONSTANT.MESSAGE.REQUIRED_FIELDS_MISSING,
        error: messArr.join(", "),
      });
    } else {
      USER_COLLECTION.create(req.body)
        .then((result) => {
          return res.status(400).send({
            message:
              CONSTANT.COLLECTION.USER +
              CONSTANT.MESSAGE.REGISTER_SUCCESSFULLY,
          })
        })
        .catch((err) => {
          return res.status(500).send({
            message: err.message || CONSTANT.MESSAGE.ERROR_OCCURRED,
          });
        });
    }
  } catch (err) {
    return res.status(500).json({ message: CONSTANT.MESSAGE.SOMETHING_WRONG });
  }
};

/*
Topic: function for send register email
*/
function sendEmail(obj, templateData, callback) {
  var OTP = commonService.generateOTP();
  var header = commonService.getHeader();
  var footer = commonService.getFooter();

  const TO = obj.email;
  const Subject = obj.subject;
  commonService.getOtpVerificationHTML(
    OTP,
    header,
    footer,
    templateData,
    (htmlTemplate) => {
      var mailOptions = {
        to: TO,
        from: '"Airwe" <vinay.pixerfect@gmail.com>',
        subject: Subject,
        html: htmlTemplate,
      };

      commonService.sendCommonEmail(mailOptions, (result) => {
        if (result.status === CONSTANT.FAIL) {
          callback({
            status: CONSTANT.FAIL,
            message: CONSTANT.MESSAGE.FAIL_TO_SEND_EMAIL,
            err: result.err,
          });
        } else {
          USER_COLLECTION.findOneAndUpdate(
            {
              email: obj.email,
            },
            {
              $set: {
                OTP: OTP,
              },
            }
          )
            .then(() => {
              callback({
                status: 200,
                message: CONSTANT.MESSAGE.OTP_SENT_SUCCESSFULLY,
                userId: obj._id,
              });
            })
            .catch((err) => {
              callback({
                status: CONSTANT.FAIL,
                message: CONSTANT.MESSAGE.FAIL_TO_SEND_EMAIL,
                err: err.message,
              });
            });
        }
      });
    }
  );
}

/*
Topic: function for send verify email
*/
function sendVerifyEmail(obj, templateData, callback) {
  var header = commonService.getHeader();
  var footer = commonService.getFooter();
  let password = commonService.generatePassword();
  const TO = obj.email;
  const role = obj.role;
  commonService.getPasswordVerificationHTML(
    header,
    password,
    TO,
    role,
    footer,
    templateData,
    (htmlTemplate) => {
      var mailOptions = {
        to: TO,
        from: '"Airwe" <vinay.pixerfect@gmail.com>',
        subject: CONSTANT.MESSAGE.VERIFICATION_MAIL,
        html: htmlTemplate,
      };

      commonService.sendCommonEmail(mailOptions, (result) => {
        if (result.status === CONSTANT.FAIL) {
          callback({
            status: CONSTANT.FAIL,
            message: CONSTANT.MESSAGE.FAIL_TO_SEND_EMAIL,
            err: result.err,
          });
        } else {
          USER_COLLECTION.findOneAndUpdate(
            {
              email: obj.email,
            },
            {
              $set: {
                password: commonService.encryptPWD(password),
                status: CONSTANT.ACTIVE,
                isEmailVerified: CONSTANT.TRUE,
              },
            }
          )
            .then(() => {
              callback({
                status: 200,
                message: CONSTANT.MESSAGE.OTP_SENT_SUCCESSFULLY,
                userId: obj._id,
              });
            })
            .catch((err) => {
              callback({
                status: CONSTANT.FAIL,
                message: CONSTANT.MESSAGE.FAIL_TO_SEND_EMAIL,
                err: err.message,
              });
            });
        }
      });
    }
  );
}

/*
Topic: function for send status email
*/
function sendStatusEmail(result, templateData, callback) {
  var header = commonService.getHeader();
  var footer = commonService.getFooter();
  const TO = result.email;
  const status = result.status;

  commonService.getStatusOnHTML(
    header,
    status,
    footer,
    templateData,
    (htmlTemplate) => {
      var mailOptions = {
        to: TO,
        from: '"Airwe" <vinay.pixerfect@gmail.com>',
        subject: CONSTANT.MESSAGE.STATUS_MAIL,
        html: htmlTemplate,
      };
      commonService.sendCommonEmail(mailOptions, (result) => {
        if (result.status === CONSTANT.FAIL) {
          callback({
            status: CONSTANT.FAIL,
            message: CONSTANT.MESSAGE.FAIL_TO_SEND_EMAIL,
            err: result.err,
          });
        } else {
          USER_COLLECTION.find({
            email: obj.email,
          })
            .then(() => {
              callback({
                status: 200,
                message: CONSTANT.MESSAGE.UPDATED_SUCCESSFULLY,
                userId: result._id,
              });
            })
            .catch((err) => {
              callback({
                status: CONSTANT.FAIL,
                message: CONSTANT.MESSAGE.FAIL_TO_SEND_EMAIL,
                err: err.message,
              });
            });
        }
      });
    }
  );
}

// function for add user in stream chat
async function createUser(result, callback) {
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.SECRET_KEY;
  const client = new StreamChat(apiKey, apiSecret);
  let role = result.role;
  if (role === "customer") {
    role = "user";
  }
  let user = await client.upsertUser({
    id: result._id,
    name: result.name,
    role: role,
  });

  if (!user) {
    callback(error);
  } else {
    callback(null);
  }
}
