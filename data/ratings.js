//I pledge my honor that I have abided by the Stevens Honor System.
//Rachel Kim
const mongoCollections = require("./mongoCollections");
const ratings = mongoCollections.ratings;
const courses = mongoCollections.courses;
const {ObjectId} = require("mongodb");

module.exports = {
    async create(courseCode, author, datePosted, tags, rating, review){
        if(courseCode===undefined || typeof(courseCode)!="string" || courseCode.trim().length==0) {
            throw "courseCode parameter is invalid";
        }
        //add check if courseCode exists in courses database
        if(author===undefined || typeof(author)!="string" || author.trim().length==0){
            throw "author parameter is invalid";
        }
        if(datePosted===undefined || typeof(datePosted)!="string" || datePosted.trim().length==0){
            throw "datePosted parameter is invalid";
        }
        if(tags===undefined || typeof(tags)!="array"){
            throw "tags parameter is invalid";
        }
        if(rating===undefined || typeof(rating)!="number"){
            throw "rating parameter is invalid";
        }
        if(typeof(review)!="string"){
            throw "review parameter is invalid";
        }
        const ratingCollection = await ratings();
        
        let newRating = {
            courseCode: courseCode,
            author: author,
            datePosted: datePosted,
            tags: tags,
            rating: rating,
            review: review,
            comments: []
        };
      
        const insertInfo = await ratingCollection.insertOne(newrating);
        if (insertInfo.insertedCount === 0) {
            throw "Could not add rating";
        }
        const newId = insertInfo.insertedId;
        const rating = await this.get(ObjectId(newId).toString());
        return rating;
    },

    async getAll(){
        const ratingCollection = await ratings();
        const all = await ratingCollection.find({}).toArray();
        return all;
    },

    async get(id) {
        if(id===undefined || typeof(id)!="string") {
            throw "id is not a string";
        }
        const ratingCollection = await ratings();
        const rate = await ratingCollection.findOne({ _id: ObjectId(id) });
        if (rate === null) {
            throw "No rating with that id";
        }
        return rate;
    },

    async remove(id) {
        if(id===undefined || typeof(id)!="string") {
            throw "id is not a string";
        }    
        const ratingCollection = await ratings();
        const deletionInfo = await ratingCollection.removeOne({ _id: ObjectId(id) });
    
        if (deletionInfo.deletedCount === 0) {
          throw `Could not delete rating with id of ${id}`;
        }
    },

    async editRating(id, newRating){
        if(id===undefined || typeof(id)!="string") {
            throw "id is not a string";
        }   
        if(newRating===undefined || typeof(newRating)!="number"){
            throw "rating parameter is invalid";
        } 
        const ratingCollection = await ratings();
        const rate = await ratingCollection.findOne({ _id: ObjectId(id) });
        if(rate===null){
            throw "rating with this id not found";
        }
        const updateInfo = await ratingCollection.updateOne({_id: ObjectId(id)}, {$set: {rating: newRating}});
        if (updateInfo.modifiedCount === 0) {
            throw "could not update rating successfully";
        }    
        return await this.get(id);
    },

    async editTags(id, newTags){
        if(id===undefined || typeof(id)!="string") {
            throw "id is not a string";
        }   
        if(newTags===undefined || typeof(newTags)!="array"){
            throw "tags parameter is invalid";
        }
        const ratingCollection = await ratings();
        const rate = await ratingCollection.findOne({ _id: ObjectId(id) });
        if(rate===null){
            throw "rating with this id not found";
        }
        const updateInfo = await ratingCollection.updateOne({_id: ObjectId(id)}, {$set: {tags: newTags}});
        if (updateInfo.modifiedCount === 0) {
            throw "could not update rating successfully";
        }    
        return await this.get(id);
    },

    async editReview(id, newReview){
        if(id===undefined || typeof(id)!="string") {
            throw "id is not a string";
        }   
        if(newReview===undefined || typeof(newReview)!="string"){
            throw "tags parameter is invalid";
        }
        const ratingCollection = await ratings();
        const rate = await ratingCollection.findOne({ _id: ObjectId(id) });
        if(rate===null){
            throw "rating with this id not found";
        }
        const updateInfo = await ratingCollection.updateOne({_id: ObjectId(id)}, {$set: {review: newReview}});
        if (updateInfo.modifiedCount === 0) {
            throw "could not update rating successfully";
        }    
        return await this.get(id);
    },

    async addComment(id, author, datePosted, comment){
        if(id===undefined || typeof(id)!="string") {
            throw "id is not a string";
        }
        if(author===undefined || typeof(author)!="string" || author.trim().length==0){
            throw "author parameter is invalid";
        }
        if(datePosted===undefined || typeof(datePosted)!="string" || datePosted.trim().length==0){
            throw "datePosted parameter is invalid";
        }
        if(comment===undefined || typeof(comment)!="string" || comment.trim().length==0){
            throw "comment parameter is invalid";
        }
        const ratingCollection = await ratings();
        const rate = await ratingCollection.findOne({ _id: ObjectId(id) });
        if(rate===null){
            throw "rating with this id not found";
        }
        let newRating = {
            courseCode: courseCode,
            author: author,
            datePosted: datePosted,
            tags: tags,
            rating: rating,
            review: review,
            comments: []
        };
    }

    // async recourseCode(id, newcourseCode) {
    //     if(id===undefined || typeof(id)!="string") {
    //         throw "id is not a string";
    //     }  
    //     if(newcourseCode===undefined || typeof(newcourseCode)!="string" || newcourseCode.trim().length==0) {
    //         throw "courseCode parameter is invalid";
    //     }
    //     const ratingCollection = await ratings();
    //     const ani = await ratingCollection.findOne({ _id: ObjectId(id) });
    //     if(ani===null){
    //         throw "rating with this id not found"
    //     }
    //     const updatedrating = {
    //       courseCode: newcourseCode,
    //       author: ani.author
    //     };
    
    //     const updateInfo = await ratingCollection.updateOne({ _id: ObjectId(id) }, {$set: updatedrating});
    //     if (updateInfo.modifiedCount === 0) {
    //       throw "could not update rating successfully";
    //     }    
    //     return await this.get(id);
    // }
}