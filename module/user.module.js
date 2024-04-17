const mongoose = require("mongoose");
const CONSTANT = require("../common/constant");
const config = require("../config/default.json");
const allowedModes = CONSTANT.MODE_LIST;
const allowedRoles = CONSTANT.ROLE_LIST;

const UsersSchema = mongoose.Schema(
  {
    srNo1: {
      type: String, default: CONSTANT.NULL_STRING
    },
    srNo2: {
      type: String, default: CONSTANT.NULL_STRING
    },
    date1: {
      type: Date, default: CONSTANT.NULL_STRING
    },
    day: {
      type: String, default: CONSTANT.NULL_STRING
    },
    shift: {
      type: String, default: CONSTANT.NULL_STRING
    },
    color: {
      type: String, default: CONSTANT.NULL_STRING
    },
    akhadar: {
      type: String, default: CONSTANT.NULL_STRING
    },
    weight1: {
      type: String, default: CONSTANT.NULL_STRING
    },
    wdate1: {
      type: Date, default: CONSTANT.NULL_STRING
    },
    weight2: {
      type: String, default: CONSTANT.NULL_STRING
    },
    wdate2: {
      type: Date, default: CONSTANT.NULL_STRING
    },
    weight3: {
      type: String, default: CONSTANT.NULL_STRING
    },
    subTotal1: {
      type: String, default: CONSTANT.NULL_STRING
    },
    grandTotal: {
      type: String, default: CONSTANT.NULL_STRING
    },
    vadh: {
      type: String, default: CONSTANT.NULL_STRING
    },
    roundwala: {
      type: String, default: CONSTANT.NULL_STRING
    },
    rDate: {
      type: Date, default: CONSTANT.NULL_STRING
    },
    weight4: {
      type: String, default: CONSTANT.NULL_STRING
    },
    weight5: {
      type: String, default: CONSTANT.NULL_STRING
    },
    weight6: {
      type: String, default: CONSTANT.NULL_STRING
    },
    subTotal2: {
      type: String, default: CONSTANT.NULL_STRING
    },
    kapan: {
      type: String, default: CONSTANT.NULL_STRING
    },
    note: {
      type: String, default: CONSTANT.NULL_STRING
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("users", UsersSchema);
