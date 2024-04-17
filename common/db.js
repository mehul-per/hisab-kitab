require("dotenv").config();
const config = require('config');
const mongoose = require("mongoose");

mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        // await mongoose.connect(process.env.MONGO_URI, {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        // });
        mongoose.connect('mongodb://localhost:27017/')

        console.log(config.get("DB_SUCCESS_CONNECT"),);
    } catch (err) {
        console.log(config.get("DB_FAILED_CONNECT"),);
    }
};

module.exports = connectDB;
