const mongoCollections = require("./mongoCollections.js");
//const mongoConnection = require("./../mongoConnection.js");
const users = mongoCollections.users;
//const ObjectId = require('mongodb').ObjectId; //or ObjectID

async function createUser(firstName, lastName, email, gender, year, age){ //Need hashed password and user comments?..
    //series of checks of the entered variables making sure they exist
    if(!firstName && firstName != "string"){
        throw "You must enter your First Name";
    }
    if(!lastName && lastName != "string"){
        throw "You must enter your Last Name";
    }
    var at = '@';
    var period = '.';
    if(!email & email.indexof(at) == -1 & email.indexof(period) == -1){
        throw "You must enter a valid email adress";
    }
    if(!gender & gender != "string"){
        throw "You must enter a valid gender";
    }
    if(!year & year != "string"){
        throw "You must enter a valid school year";
    }
    if(!age & age != "var") //check that var is corret type... int is not correct i know
    {
        throw "You must enter a valid age";
    }

    const userCollection = await users(); //do we need this..
    let newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        gender: gender,
        year: year,
        age: age
};
    const insertInfo = await userCollection.insertOne(newUser);
    if(insertInfo.insertedCount ===0){
        throw "Could not enter user information";
    }
    const newId = insertInfo.insertedId;
    const user = await this.get(newId);
    return user;
}

async function getAllUsers(){
    const userCollection = await users();
    const theUser = await userCollection.find({}).toArray();
    return theUser;
}

async function getById(id){
    if (!id){
        throw "You must provide an id to search for";
    }
    const userCollection = await users();
    const theUser = await userCollection.findOne({ _id: id });
    if (theUser === null){
        throw "No user with that id";
    }
    return theUser;
}

async function removeUser(id){
    if (!id) {
        throw "You must provide an id to search for";
    }
    const userCollection = await users();
    const deletionInfo = await userCollection.removeOne({ _id: id });

    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete animal with id of ${id}`;
    }
}

async function rename(id, newName){ //idk if we want to keep this function for our proj.
    if (!id) {
        throw "You must provide an id to search for";
    }
    if (!newName && newName != "string") {
        throw "You must provide a valid name for your animal";
    }
    const userCollection = await users();
    const data = await this.get(id);

    const updatedInfo = await userCollection.updateOne({ _id: id }, {$set:{name: newName, firstName: data.firstName, lastName: data.lastName, email: data.email, gender: data.gender, year: data.year, age: data.age}});
    if (updatedInfo.modifiedCount === 0) {
      throw "could not update user successfully";
    }
    return await this.get(id);
}


module.exports = {
    createUser,
    getAllUsers,
    getById,
    removeUser,
    rename
}
