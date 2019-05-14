const mongoCollections = require("./mongoCollections.js");
const users = mongoCollections.users;
const ObjectId = require('mongodb').ObjectId; //or ObjectID
const bcrypt = require("bcrypt");

module.exports = {
    async createUser(firstName, lastName, email, password, gender, year, age){ //Need hashed password and user comments?..
        //series of checks of the entered variables making sure they exist
        if(!firstName && firstName != "string"){
            throw "You must enter your First Name";
        }
        if(!lastName && lastName != "string"){
            throw "You must enter your Last Name";
        }
        if(!password && password != "string"){
            throw "You must enter a password";
        }
        const hash = await bcrypt.hash(password, 16);
        // var at = '@';
        // var period = '.';
        // if(!email & email.indexof(at) == -1 & email.indexof(period) == -1){
        //     throw "You must enter a valid email adress";
        // }
        if(!gender & gender != "string"){
            throw "You must enter a valid gender";
        }
        if(!year & year != "string"){
            throw "You must enter a valid school year";
        }
        if(!age & age != "var") //check that var is correct type... int is not correct i know
        {
            throw "You must enter a valid age";
        }

        const userCollection = await users(); //do we need this..
        let newUser = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            hashedPassword: hash,
            gender: gender,
            year: year,
            age: age,
            ratings: [],
            comments: [],
        }
        const insertInfo = await userCollection.insertOne(newUser);
        if(insertInfo.insertedCount ===0){
            throw "Could not enter user information";
        }
        const newId = insertInfo.insertedId;
        const user = await this.getById(newId);
        return user;
    },

    async getAllUsers(){
        const userCollection = await users();
        const theUser = await userCollection.find({}).toArray();
        return theUser;
    },

    async getById(id){
        if (!id){
            throw "You must provide an id to search for";
        }
        const userCollection = await users();
        const theUser = await userCollection.findOne({ _id: ObjectId(id) });
        if (theUser === null){
            throw "No user with that id";
        }
        return theUser;
    },

    async addReview(id, reviewId){
        if (!id){
            throw "You must provide an id to search for";
        }
        if(reviewId===undefined || typeof(reviewId)!="string"){
            throw "review parameter is invalid";
        }
        const user = await this.getById(id);
        let add = user.ratings;
        add.push(reviewId);
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne({_id: ObjectId(id)}, {$set: {ratings: add}});
        if (updateInfo.modifiedCount === 0) {
            throw "could not update rating successfully";
        }
        const u = await this.getById(id);
        return u;
    },

    async removeReview(id, reviewId){
        if (!id){
            throw "You must provide an id to search for";
        }
        if(reviewId===undefined || typeof(reviewId)!="string"){
            throw "review parameter is invalid";
        }
        const user = await this.getById(id);
        let add = user.ratings;
        let found = false;
        let index = 0;
        let deleted = null;
        for(let a = 0; a<add.length; a++){
            if(add[a]==reviewId){
                deleted = add[a];
                index=a;
                found=true;
                break;
            }
        }
        if(found){
            add.splice(index,1);
        }
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne({_id: ObjectId(id)}, {$set: {ratings: add}});
        if (updateInfo.modifiedCount === 0) {
            throw "could not update rating successfully";
        }
        return deleted;
    },

    async addComment(id, comment){
        if (!id){
            throw "You must provide an id to search for";
        }
        if(comment===undefined){
            throw "comment is undefined";
        }
        const user = await this.getById(id);
        let add = user.comments;
        add.push(comment);
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne({_id: ObjectId(id)}, {$set: {comments: add}});
        if (updateInfo.modifiedCount === 0) {
            throw "could not update rating successfully";
        }
        const u = await this.getById(id);
        return u;
    },

    async deleteComment(id, cID){
        if (!id){
            throw "You must provide an id to search for";
        }
        if(cID===undefined || typeof(cID)!="string") {
            throw "comment id is not a string";
        }
        const user = await this.getById(id);
        let oldComments = user.comments;
        let found = false;
        let index=0;
        let deleted = null;
        for(let a = 0; a<oldComments.length; a++){
            if(oldComments[a]._id==cID){
                deleted = oldComments[a];
                index=a;
                found=true;
                break;
            }
        }
        if(found){
            oldComments.splice(index,1);
        } else {
            throw "could not find comment in user data"
        }
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne({_id: ObjectId(id)}, {$set: {comments: oldComments}});
        if (updateInfo.modifiedCount === 0) {
            throw "could not update rating successfully";
        }
        return deleted;
    },

    async removeUser(id){
        if (!id) {
            throw "You must provide an id to search for";
        }
        const userCollection = await users();
        const deletionInfo = await userCollection.removeOne({ _id: ObjectId(id) });

        if (deletionInfo.deletedCount === 0) {
        throw `Could not delete animal with id of ${id}`;
        }
    },

    async rename(id, newName){ //idk if we want to keep this function for our proj.
        if (!id) {
            throw "You must provide an id to search for";
        }
        if (!newName && newName != "string") {
            throw "You must provide a valid name for your animal";
        }
        const userCollection = await users();
        const data = await this.get(id);

        const updatedInfo = await userCollection.updateOne({ _id: ObjectId(id) }, {$set:{name: newName, firstName: data.firstName, lastName: data.lastName, email: data.email, gender: data.gender, year: data.year, age: data.age}});
        if (updatedInfo.modifiedCount === 0) {
        throw "could not update user successfully";
        }
        return await this.get(id);
    }
}
