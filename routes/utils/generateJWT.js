const jwt = require("jsonwebtoken");
require("dotenv").config();   // here we use dotenv module which we installed in the begining to access environment variables from .env file

const createToken = (userId) =>{
    const payLoad = {
      user: {
        id: userId,
      },
    };
    const token = jwt.sign(payLoad, "my-secret", {expiresIn: "1h"});
    return token;
  };

  module.exports = createToken;