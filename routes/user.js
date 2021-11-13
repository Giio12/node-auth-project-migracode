const express = require("express");
const bcrypt = require("bcrypt");   // bcrypt is used to hash password before saving it to database
const fs = require("fs");   // fs is node's inbuilt file system module used to manage files

const usersDb = require("../database/db.json");   // import existing data from db.json file

const generateJWT = require("./utils/generateJWT");
const authenticate = require("../middleware/authenticate.js");
const router = express.Router();   // we create a new router using express's inbuilt Router method





// user registration / sign-up
router.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await usersDb.filter(user => user.email === email);

    if (user.length > 0) {
      return res.status(400).json({error: "User already exist!"});
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    let newUser = {
      id: usersDb.length,
      name: name,
      email: email,
      password: bcryptPassword
    }

    usersDb.push(newUser);  // we add newUser to usersDb array


    // we save the updated array to db.json file by using fs module of node
    
    await fs.writeFileSync('./database/db.json', JSON.stringify(usersDb,null,4));


    /* Once the user registration is done successfully, we will generate a
      jsonwebtoken and send it back to user. This token will be used for
      accessing other resources to verify identity of the user.
      
      The following generateJWT function does not exist till now but we
      will create it in the next step. */
    
    const jwtToken = generateJWT(newUser.id);

    return res.status(201).send({ jwtToken: jwtToken, isAuthenticated: true});

  } catch (error) {
    console.error(error.message);
    res.status(500).send({error: error.message});
  }
});



// user sign-in / login
router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersDb.filter(user => user.email === email);

    if (user.length === 0) {
      return res.status(401).json({error: "Invalid Credential", isAuthenticated: false});
    }


    // if the user exist then we will compare the password provided by user with the hashed password we stored during user registration
    const isValidPassword = await bcrypt.compare(
      password,
      user[0].password
    );

    if (!isValidPassword) {
      return res.status(401).json({error: "Invalid Credential", isAuthenticated: false});
    }

    
    // if the password matches with hashed password then we generate a new token and send it back to user
    const jwtToken = generateJWT(user[0].id);

    return res.status(200).send({ jwtToken, isAuthenticated: true });

  } catch (error) {
    console.error(error.message);
    res.status(500).send({error: error.message});
  }
});

// user authorization
router.post("/auth", authenticate, (req, res) => {
  try {
    
    res.status(200).send({isAuthenticated: true});

  } catch (error) {
    console.error(error.message);
    res.status(500).send({error: error.message, isAuthenticated: false});
  }
});

module.exports = router;   // we need to export this router to implement it inside our server.js file





// const fs = require("fs");
// const bcrypt = require("bcrypt");
// const express = require("express");
// const app = express();
// const cors = require("cors");
// const corsOptions = {
//     origin: "http://localhost:3000"
// };
// const db ="./database/db.json";
// const users= require(db);
// const saveUsers = (arr)=>{
//     const text = JSON.stringify(arr,null,4)
//     fs.writeFileSync(db,text);
// };
// const createToken = require("./routes/utils/generateJWT.js");
// const signinFunction = require("./routes/users.js")
// // parse requests of content-type - application/json
// app.use(express.json());
// app.use(cors(corsOptions));  // enable CORS
// // simple route
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to MigraCode Auth application." });
// });







// app.post("/sign-up", function(request, response){
//     const newUser = request.body;
//     const sameEmailUser = users.find((u)=> u.email === newUser.email);
//     if(sameEmailUser){
//         response
//         .status(400)
//         .json({error:`user with email ${newUser.email} already exists`});
//     }else {
//         newUser.id = users.length + 1;
//         const salt = bcrypt.genSaltSync()
//         newUser.password = bcrypt.hashSync(newUser.password, salt);
//         users.push(newUser);
//         saveUsers(users);

//         const token = createToken(newUser.id);

//         return response.status(201).json({jwtToken: token, isAuthenticated: true});
//     }
//   });

// app.post("/sign-in", signinFunction);
// // set port, listen for requests
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}.`);
// });


// const fs = require("fs");
// const bcrypt = require("bcrypt");
// const express = require("express");
// const app = express();
// const cors = require("cors");
// const corsOptions = {
//     origin: "http://localhost:3000"
// };

// const db ="../database/db.json";
// const users= require(db);
// const saveUsers = (arr)=>{
//     const text = JSON.stringify(arr,null,4)
//     fs.writeFileSync(db,text);
// };
// const createToken = require("../routes/utils/generateJWT.js");
// // user sign-in / login
// const signinFunction = (req, res) => {
//     const { email, password } = req.body;
  
//     try {
//       const user = users.filter(user => user.email === email);
  
//       if (user.length === 0) {
//         return res.status(401).json({error: "Invalid Credential", isAuthenticated: false});
//       }
  
  
//       // if the user exist then we will compare the password provided by user with the hashed password we stored during user registration
//       const isValidPassword =  bcrypt.compare(
//         password,
//         user[0].password
//       );
  
//       if (!isValidPassword) {
//         return res.status(401).json({error: "Invalid Credential", isAuthenticated: false});
//       }
  
      
//       // if the password matches with hashed password then we generate a new token and send it back to user
//       const token = createToken(user[0].id);

//       return res.status(201).json({jwtToken:token, isAuthenticated: true});
  
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send({error: error.message});
//     }
//   };

//   module.exports = signinFunction;