const { check } = require("express-validator");
const CONSTANT = require("../common/constant");
const phoneNoRegex = /^\d{10,12}$/;
const nameRegex = /^[A-Za-z\s\-]+$/;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;

const userSignupValidators = [
  check("name")
    .optional()
    .custom((value) => {
      if (value && !nameRegex.test(value)) {
        throw new Error(CONSTANT.COMMON.NAME + CONSTANT.MESSAGE.IS_INVALID);
      }
      return true;
    }),

  check("phoneNo")
    .optional()
    .custom((value) => {
      if (value && !phoneNoRegex.test(value)) {
        throw new Error(
          CONSTANT.COMMON.PHONE_NO + CONSTANT.MESSAGE.PHONE_DIGIT
        );
      }
      return true;
    }),

  check("email").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.EMAIL + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    if (value && !emailRegex.test(value)) {
      throw new Error(CONSTANT.COMMON.EMAIL + CONSTANT.MESSAGE.IS_INVALID);
    }
    return true;
  }),

  check("password").custom((value, { req }) => {
    const { mode } = req.body;
    if (mode === "manual") {
      if (!value || value.replace(/\s*/g, "").length <= 0) {
        throw new Error(
          CONSTANT.COMMON.PASSWORD + CONSTANT.MESSAGE.IS_REQUIRED
        );
      }
    }
    return true;
  }),

  check("mode").custom((value, { req }) => {
    const allowedModes = CONSTANT.MODE_LIST;
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.MODE + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    if (req.body.role === "admin" && value !== CONSTANT.COMMON.MANUAL) {
      throw new Error(CONSTANT.MESSAGE.INVALID_MODE);
    }
    if (!allowedModes.includes(value)) {
      throw new Error(CONSTANT.MESSAGE.INVALID_MODE);
    }
    return true;
  }),

  check("role")
    .optional()
    .custom((value, { req }) => {
      const allowedRoles = CONSTANT.ROLE_LIST;
      if (!value) {
        throw new Error(CONSTANT.COMMON.ROLE + CONSTANT.MESSAGE.IS_REQUIRED);
      }
      if (
        value === CONSTANT.COMMON.CUSTOMER &&
        req.body.mode === CONSTANT.COMMON.MANUAL &&
        (!req.body.deviceToken || !req.body.deviceType)
      ) {
        throw new Error(
          CONSTANT.COMMON.DEVICE_TOKEN +
            " or " +
            CONSTANT.COMMON.DEVICE_TYPE +
            CONSTANT.MESSAGE.IS_REQUIRED
        );
      }
      if (!allowedRoles.includes(value)) {
        throw new Error(CONSTANT.MESSAGE.INVALID_ROLE);
      }
      return true;
    }),

  check("deviceType")
    .optional()
    .custom((value) => {
      const allowedDeviceTypes = [CONSTANT.COMMON.ANDROID, CONSTANT.COMMON.IOS];
      if (!allowedDeviceTypes.includes(value)) {
        throw new Error(CONSTANT.MESSAGE.INVALID_DEVICE_TYPE);
      }
      return true;
    }),
];

const userLoginValidators = [
  check("email").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.EMAIL + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    return true;
  }),

  check("password").custom((value, { req }) => {
    const { mode } = req.body;
    if (mode === "manual") {
      if (!value || value.replace(/\s*/g, "").length <= 0) {
        throw new Error(
          CONSTANT.COMMON.PASSWORD + CONSTANT.MESSAGE.IS_REQUIRED
        );
      }
    }
    return true;
  }),

  check("role")
    .optional()
    .custom((value, { req }) => {
      const allowedRoles = CONSTANT.ROLE_LIST;
      if (!value) {
        throw new Error(CONSTANT.COMMON.ROLE + CONSTANT.MESSAGE.IS_REQUIRED);
      }
      if (
        value === CONSTANT.COMMON.CUSTOMER &&
        req.body.mode === CONSTANT.COMMON.MANUAL &&
        (!req.body.deviceToken || !req.body.deviceType)
      ) {
        throw new Error(
          CONSTANT.COMMON.DEVICE_TOKEN +
            " or " +
            CONSTANT.COMMON.DEVICE_TYPE +
            CONSTANT.MESSAGE.IS_REQUIRED
        );
      }
      if (!allowedRoles.includes(value)) {
        throw new Error(CONSTANT.MESSAGE.INVALID_ROLE);
      }
      return true;
    }),

  check("mode").custom((value, { req }) => {
    const allowedModes = CONSTANT.MODE_LIST;

    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.MODE + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    if (
      req.body.role === CONSTANT.COMMON.ADMIN &&
      value !== CONSTANT.COMMON.MANUAL
    ) {
      throw new Error(CONSTANT.MESSAGE.INVALID_MODE);
    }
    if (!allowedModes.includes(value)) {
      throw new Error(CONSTANT.MESSAGE.INVALID_MODE);
    }

    return true;
  }),

  check("deviceType")
    .optional()
    .custom((value) => {
      const allowedDeviceTypes = [CONSTANT.COMMON.ANDROID, CONSTANT.COMMON.IOS];
      if (!allowedDeviceTypes.includes(value)) {
        throw new Error(CONSTANT.MESSAGE.INVALID_DEVICE_TYPE);
      }
      return true;
    }),
];

const userVerifyValidators = [
  check("OTP").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.OTP + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    return true;
  }),

  check("email").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.EMAIL + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    return true;
  }),
];

const userForgotValidators = [
  check("email").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.EMAIL + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    return true;
  }),
];

const userForgotResetValidators = [
  check("email").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.EMAIL + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    return true;
  }),
  check("password").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(
        CONSTANT.COMMON.NEW_PASSWORD + CONSTANT.MESSAGE.IS_REQUIRED
      );
    }
    return true;
  }),
  check("confirmPassword").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(
        CONSTANT.COMMON.CONFIRM_PASSWORD + CONSTANT.MESSAGE.IS_REQUIRED
      );
    }
    return true;
  }),
  check("otp").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.OTP + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    return true;
  }),
];

const userResetValidators = [
  check("email").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.EMAIL + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    return true;
  }),
  check("newPassword").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(
        CONSTANT.COMMON.NEW_PASSWORD + CONSTANT.MESSAGE.IS_REQUIRED
      );
    }
    return true;
  }),
  check("confirmPassword").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(
        CONSTANT.COMMON.CONFIRM_PASSWORD + CONSTANT.MESSAGE.IS_REQUIRED
      );
    }
    return true;
  }),
];

const createUserValidators = [
  check("email").custom((value) => {
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.EMAIL + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    return true;
  }),

  check("name")
    .optional()
    .custom((value) => {
      if (value && !nameRegex.test(value)) {
        throw new Error(CONSTANT.COMMON.NAME + CONSTANT.MESSAGE.IS_INVALID);
      }
      return true;
    }),

  check("phoneNo")
    .optional()
    .custom((value) => {
      if (value && !phoneNoRegex.test(value)) {
        throw new Error(
          CONSTANT.COMMON.PHONE_NO + CONSTANT.MESSAGE.PHONE_DIGIT
        );
      }
      return true;
    }),

  check("role").custom((value) => {
    const allowedRoles = CONSTANT.ROLE_LIST;
    if (!value || value.replace(/\s*/g, "").length <= 0) {
      throw new Error(CONSTANT.COMMON.ROLE + CONSTANT.MESSAGE.IS_REQUIRED);
    }
    if (!allowedRoles.includes(value)) {
      throw new Error(CONSTANT.MESSAGE.INVALID_ROLE);
    }
    return true;
  }),
];

module.exports = {
  userSignupValidators,
  userLoginValidators,
  userVerifyValidators,
  userForgotValidators,
  userForgotResetValidators,
  userResetValidators,
  createUserValidators,
};
