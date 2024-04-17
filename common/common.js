const crypto = require("crypto");
var multer = require("multer");
const fs = require("fs");
const mongodb = require("mongodb");
const jwt = require("jsonwebtoken");
const config = require("config");
const CONSTANT = require("../common/constant");
const path = require("path");
const ALGO = config.get("ALGO");
const ENCRYPTION_KEY = config.get("ENCRYPTION_KEY");
const IV_LENGTH = config.get("IV_LENGTH");
const ejs = require("ejs");
const { createLogger, format, transports } = require("winston");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const serviceAccount = require("../otherData/airwe-4561a-firebase-privateKey.json");
const winston = require("winston");
const { callbackify } = require("util");
const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  service: process.env.SERVICE,
  port: process.env.PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/*-------------------------------------------------------*/

exports.isUndefinedOrNull = _isUndefinedOrNull;
exports.isObjEmpty = _isObjEmpty;
exports.isArrayEmpty = _isArrayEmpty;
exports.isValidEmail = _isValidEmail;
exports.encryptPWD = _encryptPWD;
exports.decryptPWD = _decryptPWD;
exports.UUID = _UUID;
exports.isValidURL = _isValidURL;
exports.generateHashCode = _generateHashCode;
exports.getOtpVerificationHTML = _getOtpVerificationHTML;
exports.getPasswordVerificationHTML = _getPasswordVerificationHTML;
exports.sendCommonEmail = _sendCommonEmail;
exports.generateOTP = _generateOTP;
exports.generatePassword = _generatePassword;
exports.isValidObjId = _isValidObjId;
exports.pictureUploadFunction = _pictureUploadFunction;
exports.getStatusOnHTML = _getStatusOnHTML;
exports.generateToken = _generateToken;
exports.getUserDetail = _getUserDetail;
exports.containsAllItemInArray = _containsAllItemInArray;
exports.getLogData = _getLogData;
exports.isCancleReasonValidOrNot = _isCancleReasonValidOrNot;
exports.getUserIdFromToken = _getUserIdFromToken;
exports.sendPushNotification = _sendPushNotification;
exports.groupBy = _groupBy;
exports.groupByNew = _groupByNew;
exports.getAverage = _getAverage;
exports.getHeader = _getHeader;
exports.getFooter = _getFooter;
exports.getPaymentSuccessHTML = _getPaymentSuccessHTML;
exports.getPaymentCancelHTML = _getPaymentCancelHTML;
exports.getPaymentRefundHTML = _getPaymentRefundHTML;
/*-------------------------------------------------------*/

/*
To grouping data.
*/
function _groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    var key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

/*
To grouping data.
*/
function _groupByNew(objectArray, property, subProperty) {
  return objectArray.reduce(function (acc, obj) {
    if (obj[property] && obj[property][subProperty]) {
      var key = obj[property][subProperty];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
    }
    return acc;
  }, {});
}

// get average value
function _getAverage(numbers) {
  if (numbers.length === 0) {
    return 0;
  }

  const sum = numbers.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  );
  const average = sum / numbers.length;
  const getAverage = average.toFixed(1);

  return parseFloat(getAverage);
}

// check email valid or not
function _isValidEmail(email) {
  if (!email) return false;
  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  email = email.trim();
  return re.test(email.toLowerCase());
}

// get user id from token

function _getUserIdFromToken(req) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.decode(token);
    const userId = decodedToken.userId;
    const role = decodedToken.role;
    const name = decodedToken.name;
    return { userId, role, name };
  } catch (error) {
    return null;
  }
}

/// send push notification
async function _sendPushNotification() {
  const message = {
    notification: {
      title: "New Message",
      body: "You have a new message!",
    },
    token:
      "cnX4U_1pSc-FEU0zShVtN3:APA91bErh1BIxec566a36E9IUShrAQDTBeq6UoQU743rcO8a1P3zgBklbTjs7830BQNGohLwzcb1JDOMvD0LQ25HSlGmhaXDt8wgY9Ly3Q-bbJXlZaQ6P2hclm6hy12xJPO2SNCvb0LU",
  };
  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent notification:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

/*
To string encrypt
*/
function _encryptPWD(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(ALGO, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/*
To string decrypt
*/
function _decryptPWD(text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(ALGO, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/*
Generate uniqueID  function
*/
function _UUID() {
  var result = "";
  var characters = CONSTANT.CHARACTERS;
  var charactersLength = characters.length;
  for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/*
To check value is undefined or null.
*/
function _isUndefinedOrNull(value) {
  return typeof value == CONSTANT.UNDEFINED || value == null || value == "";
}

/*
To check validate a URL
 */
function _isValidURL(url) {
  if (_isUndefinedOrNull(url)) {
    return false;
  }
  let re =
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
  return re.test(url.toLowerCase());
}

/*
To check object is undefined or null.
*/
function _isObjEmpty(obj) {
  return (
    typeof obj == CONSTANT.UNDEFINED || obj == null || !Object.keys(obj).length
  );
}

/*
To check value is empty array.
*/
function _isArrayEmpty(array) {
  return (
    typeof array == CONSTANT.UNDEFINED || array == null || array.length <= 0
  );
}

/*
to generate hashCode
*/
function _generateHashCode() {
  return crypto.randomBytes(16).toString("hex");
}

/*
to generate email html
*/

function _getOtpVerificationHTML(OTP, header, footer, templateData, callback) {
  fs.readFile(
    path.resolve(__dirname, "../public/verification.ejs"),
    function (error, html) {
      if (error) {
        throw error;
      }

      const d = {
        type: "Buffer",
        data: html,
      };
      let htmlTemplate = Buffer.from(d.data).toString();
      htmlTemplate = htmlTemplate.replace("%{OTP}", OTP);
      htmlTemplate = htmlTemplate.replace("%{header}", header);
      htmlTemplate = htmlTemplate.replace("%{footer}", footer);
      const renderedTemplate = ejs.render(htmlTemplate, templateData);
      callback(renderedTemplate);
    }
  );
}

function _getPaymentSuccessHTML(username, header, footer, callback) {
  fs.readFile(
    path.resolve(__dirname, "../public/success-payment.ejs"),
    function (error, html) {
      if (error) {
        throw error;
      }
      const d = {
        type: "Buffer",
        data: html,
      };
      let htmlTemplate = Buffer.from(d.data).toString();
      htmlTemplate = htmlTemplate.replace("%{header}", header);
      htmlTemplate = htmlTemplate.replace("%{username}", username);
      htmlTemplate = htmlTemplate.replace("%{footer}", footer);
      callback(htmlTemplate);
    }
  );
}

function _getPaymentCancelHTML(username, header, footer, callback) {
  fs.readFile(
    path.resolve(__dirname, "../public/cancel-payment.ejs"),
    function (error, html) {
      if (error) {
        throw error;
      }
      const d = {
        type: "Buffer",
        data: html,
      };
      let htmlTemplate = Buffer.from(d.data).toString();
      htmlTemplate = htmlTemplate.replace("%{header}", header);
      htmlTemplate = htmlTemplate.replace("%{username}", username);
      htmlTemplate = htmlTemplate.replace("%{footer}", footer);
      callback(htmlTemplate);
    }
  );
}

function _getPaymentRefundHTML(username, header, footer, callback) {
  fs.readFile(
    path.resolve(__dirname, "../public/refund-payment.ejs"),
    function (error, html) {
      if (error) {
        throw error;
      }
      const d = {
        type: "Buffer",
        data: html,
      };
      let htmlTemplate = Buffer.from(d.data).toString();
      htmlTemplate = htmlTemplate.replace("%{header}", header);
      htmlTemplate = htmlTemplate.replace("%{username}", username);
      htmlTemplate = htmlTemplate.replace("%{footer}", footer);
      callback(htmlTemplate);
    }
  );
}

function _getPasswordVerificationHTML(
  header,
  password,
  TO,
  role,
  footer,
  templateData,
  callback
) {
  fs.readFile(
    path.resolve(__dirname, "../public/create-user.ejs"),
    function (error, html) {
      if (error) {
        throw error;
      }
      const d = {
        type: "Buffer",
        data: html,
      };
      let htmlTemplate = Buffer.from(d.data).toString();
      htmlTemplate = htmlTemplate.replace("%{header}", header);
      htmlTemplate = htmlTemplate.replace("%{footer}", footer);
      htmlTemplate = htmlTemplate.replace("%{email}", "Email: " + TO);
      htmlTemplate = htmlTemplate.replace(
        "%{password}",
        "Password: " + password
      );

      htmlTemplate = htmlTemplate.replace("%{role}", "Role: " + role);
      const renderedTemplate = ejs.render(htmlTemplate, templateData);
      callback(renderedTemplate);
    }
  );
}

/*
to generate email html
*/
function _getStatusOnHTML(header, status, footer, templateData, callback) {
  fs.readFile(
    path.resolve(__dirname, "../public/status.ejs"),
    function (error, html) {
      if (error) {
        throw error;
      }

      const d = {
        type: "Buffer",
        data: html,
      };
      let htmlTemplate = Buffer.from(d.data).toString();
      htmlTemplate = htmlTemplate.replace("%{status}", status);
      htmlTemplate = htmlTemplate.replace("%{header}", header);
      htmlTemplate = htmlTemplate.replace("%{footer}", footer);
      const renderedTemplate = ejs.render(htmlTemplate, templateData);
      callback(renderedTemplate);
    }
  );
}

/*
OTP generator( 8 digit) function
*/
function _generateOTP() {
  let digits = CONSTANT.DIGITS;
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

//get header in email
function _getHeader() {
  return `
 <tr>
  <td style="text-align: center">
    <a  title="logo" target="_blank">
      <img class="logo"
        style="width:25%;"
        src="https://drive.google.com/uc?export=view&id=1modJhCpNXRcKOCgHONsfMHcArqDcjDpT"
        title="logo"
        alt="logo"
      />
    </a>
  </td>
</tr>
`;
}

//get footer in email
function _getFooter() {
  return `
<tr style="text-align: center; color: black; background-color: #efefef">
  <td style="text-align: center">
    <p style="text-align: center">
      © AirWe Connecting Travelers | 221 xyz xyz xyz xyz xyz
      838383-4545 | airwe@travellers.com
    </p>
    <p style="text-align: center">
      <a>AirWe</a> | <a>AirWe Support</a> 
      <a>AirWe Connecting Travelers</a>
    </p>
    <p class ="d-flex">
            <div class="svg-container">
        <img style="width: 20px;height: 20px;padding-top:20%"
          src="https://drive.google.com/uc?export=view&id=17ziJkJvpkPdt5QuoeVaJoChHn4SJNcKs"
          alt="facebook"/>
      </div>
            <div class="svg-container">
        <img style="width: 20px;height: 20px;padding-top: 27%;"
          src="https://drive.google.com/uc?export=view&id=1RpdhTtVoYZ5eCLexP8kaWuNRwqnriGul"
          alt="instagram"/>
      </div>
            <div class="svg-container">
        <img style="width: 20px;height: 20px;padding-top: 27%;"
          src="https://drive.google.com/uc?export=view&id=1A41BEMgaSXfIK9TrmBCe6G7pPLtSMv7m"
          alt="twitter"/>
      </div>
    </p>
  </td>
</tr>
`;
}

/*
password generator( 8 digit) function
*/
function _generatePassword() {
  var characters = CONSTANT.CHARACTERS;
  var password = "";
  for (var i = 0; i < 8; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return password;
}

/*
token generator( 10 digit) function
*/
function _generateToken() {
  let characters = CONSTANT.PWD_CHAR;
  let token = "";
  for (let i = 0; i < 10; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}
/*
To check id is valid or not.
*/
function _isValidObjId(id) {
  if (!_isUndefinedOrNull(id)) {
    return mongodb.ObjectId.isValid(id);
  } else {
    return false;
  }
}

/*
To check id is valid or not.
*/
function _isCancleReasonValidOrNot(value) {
  if (!value) {
    return false;
  } else {
    let index = CONSTANT.PAYMENT_CONSTANT.REASON_LIST.findIndex(
      (a) => a.value === value
    );
    if (index > -1) {
      return true;
    } else {
      return false;
    }
  }
}

// send email
function _sendCommonEmail(mailOptions, callback) {
  // Verify transporter configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(CONSTANT.MESSAGE.ERROR_VERIFY_TRANSPORTER, error);
      if (callback) {
        callback(error, null);
      }
    } else {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(CONSTANT.MESSAGE.ERROR_SEND_MAIL, error);
          if (callback) {
            callback(error, null);
          }
        } else {
          console.log(CONSTANT.MESSAGE.ERROR_SENT, info.response);
          callback({
            status: CONSTANT.SUCCESS,
            message: CONSTANT.MESSAGE.EMAIL_SENT_SUCCESSFULLY,
          });
        }
      });
    }
  });
}

// profile uploading
function _pictureUploadFunction(folder, req, res, callback) {
  var files = [];
  var file_name;
  var type;
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      var name = _UUID();
      var date = new Date().getTime();
      if (!req) {
        cb(null, file.fieldname + "-" + date + path.extname(file.originalname));
        file_name =
          file.fieldname + "-" + date + path.extname(file.originalname);
      } else {
        cb(null, name + path.extname(file.originalname));
        file_name = name + path.extname(file.originalname);
      }
      type = file.fieldname;
      if (type == CONSTANT.FIELD.ATTACHMENT) {
        files.push({
          filename: file_name,
          timestamp: date,
          extension: path.extname(file.originalname),
          originalname: file.originalname,
          fieldName: type,
        });
      }
    },
  });
  var upload = multer({ storage: storage }).fields([
    { name: CONSTANT.FIELD.ATTACHMENT },
  ]);

  // // to declare some path to store your converted image
  upload(req, res, (err, i) => {
    if (err) {
      callback(err, []);
    } else {
      var res_files = [];
      res_files.push(files);
      callback(null, files);
    }
  });
}

function _getUserDetail(req) {
  const token = req.body.token || req.query.token || req.headers.authorization;
  if (token) {
    let userToken = token.split(" ")[1];
    let user = jwt.decode(userToken);
    return user;
  }
  return token;
}

function _containsAllItemInArray(arr1, arr2) {
  return arr2.every((arr2Item) => arr1.includes(arr2Item));
}

function _getLogData() {
  let logData = "";
  try {
    console.log(__dirname + "/..");
    const data = fs.readFileSync(__dirname + "/../logs/server.log", "utf8");
    const logs = data.trim().split("\n");

    // Get the last log entry
    const latestLog = logs[logs.length - 1];

    logData = latestLog;
  } catch (err) {
    logData = err;
  }
  return logData;
}

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${level}: ${timestamp} :\t${message}`;
});

exports.logger = createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new transports.File({
      filename: "logs/server.log",
      format: format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        format.align(),
        format.printf(
          (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
        )
      ),
    }),
  ],
});
