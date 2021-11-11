const fs = require("fs")
const bcrypt = require("bcrypt")
const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: "http://localhost:3000"
};
const db ="./routes/users.json";
const users= require(db);
const saveUsers = (arr)=>{
    const text = JSON.stringify(arr,null,4)
    fs.writeFileSync(db,text);
};
// parse requests of content-type - application/json
app.use(express.json());
app.use(cors(corsOptions));  // enable CORS
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to MigraCode Auth application." });
});

app.post("/sign-up", function(request, response){
    const newUser = request.body;
    const sameEmailUser = users.find((u)=> u.email === newUser.email);
    if(sameEmailUser){
        response
        .status(400)
        .json({error:`user with email ${newUser.email} already exists`});
    }else {
        newUser.id = users.length + 1;
        const salt = bcrypt.genSaltSync()
        newUser.password = bcrypt.hashSync(newUser.password, salt);
        users.push(newUser);
        saveUsers(users);
        response.status(201).json(newUser);
    }
  });


// set port, listen for requests
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});