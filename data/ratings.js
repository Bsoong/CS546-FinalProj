//I pledge my honor that I have abided by the Stevens Honor System.
//Rachel Kim
const mongoCollections = require("./mongoCollections");
const ratings = mongoCollections.ratings;
const courses = mongoCollections.courses;
const {ObjectId} = require("mongodb");
const Handlebars = require("handlebars");

module.exports = {
    async create(courseCode, professor, author, datePosted, tags, rating, review){
        if(courseCode===undefined || typeof(courseCode)!="string" || courseCode.trim().length==0) {
            throw "courseCode parameter is invalid";
        }
        if(professor===undefined || typeof(professor)!="string" || professor.trim().length==0) {
            throw "professor parameter is invalid";
        }
        //add check if courseCode exists in courses database
        if(author===undefined || typeof(author)!="string" || author.trim().length==0){
            throw "author parameter is invalid";
        }
        if(datePosted===undefined || typeof(datePosted)!="string" || datePosted.trim().length==0){
            throw "datePosted parameter is invalid";
        }
        if(tags===undefined){
            tags=[];
        } else {
            if(!(Array.isArray(tags))){
                throw "tags parameter is invalid";
            }
        }
        if(rating===undefined){
            throw "rating parameter is invalid";
        } else {
            rating = +rating;
        }
        if(typeof(review)!="string"){
            throw "review parameter is invalid";
        }
        const ratingCollection = await ratings();

        let newRating = {
            courseCode: courseCode,
            professor: professor,
            author: author,
            datePosted: datePosted,
            tags: tags,
            rating: rating,
            review: review,
            comments: []
        };

        const insertInfo = await ratingCollection.insertOne(newRating);
        if (insertInfo.insertedCount === 0) {
            throw "Could not add rating";
        }
        const newId = insertInfo.insertedId;
        const r = await this.get(ObjectId(newId).toString());
        return r;
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

    // async getRatingByCourseCode(code){
    //     if(code===undefined || typeof(code)!="string"){
    //         throw "code is not a string";
    //     }
    //     const ratingCollection = await ratings();
    //     const ratings = await ratingCollection.find({ courseCode: code }).toArray();
    //     if(ratings===undefined){
    //         throw "No ratings with that courseCode";
    //     }
    //     return ratings; //returns an array
    // },

    async recentRating() {
          const ratingCollection = await ratings();
          const all = await ratingCollection.find({}).toArray();
          let recentRating = all.sort(function(a,b){
            let formatDate = function (date){
                let d = date.split("/");
                let newDate = [];
                newDate.push(d.pop());
                newDate.push((d[0].length < 2) ? "0"+d[0]:d[0]);
                newDate.push((d[1].length < 2) ? "0"+d[1]:d[1]);
                return newDate.join("");
            }
              let d1 = formatDate(a.datePosted);
              let d2 = formatDate(b.datePosted);
              return((d1 < d2) ? 1:-1);
          });
          return recentRating[0];
        },
   //HighestRating
    async highestRating(){
        const ratingCollection = await ratings();
        const all = await ratingCollection.find({}).toArray();
        var bestRatings = all.sort(function(a,b) {
          return a.rating < b.rating ? 1 : -1;
        });
        return bestRatings[0];
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

    async editProfessor(id, newProfessor){
        if(id===undefined || typeof(id)!="string") {
            throw "id is not a string";
        }
        if(newProfessor===undefined || typeof(newProfessor)!="string"){
            throw "professor parameter is invalid";
        }
        const ratingCollection = await ratings();
        const rate = await ratingCollection.findOne({ _id: ObjectId(id) });
        if(rate===null){
            throw "rating with this id not found";
        }
        const updateInfo = await ratingCollection.updateOne({_id: ObjectId(id)}, {$set: {professor: newProfessor}});
        if (updateInfo.modifiedCount === 0) {
            throw "could not update professor successfully";
        }
        return await this.get(id);
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
        if(newTags===undefined){
            newTags=[];
        } else {
            if(!(Array.isArray(newTags))){
                throw "tags parameter is invalid";
            }
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
            throw "review parameter is invalid";
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

    async addComment(id, authorID, author, datePosted, comment){
        if(id===undefined || typeof(id)!="string") {
            throw "id is not a string";
        }
        if(authorID===undefined || typeof(authorID)!="string") {
            throw "author's id is not a string";
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
        let newComment = {
            _id: ObjectId(),
            reviewID: id,
            authorID: authorID,
            author: author,
            datePosted: datePosted,
            comment: comment
        };
        let newComments = rate.comments;
        newComments.push(newComment);
        const updateInfo = await ratingCollection.updateOne({_id: ObjectId(id)}, {$set: {comments: newComments}});
        if (updateInfo.modifiedCount === 0) {
            throw "could not update rating successfully";
        }
        return newComment;
    },

    async deleteComment(rID, cID) {
        if(rID===undefined || typeof(rID)!="string") {
            throw "review id is not a string";
        }
        if(cID===undefined || typeof(cID)!="string") {
            throw "comment id is not a string";
        }
        const ratingCollection = await ratings();
        const rate = await ratingCollection.findOne({ _id: ObjectId(rID) });
        if(rate===null){
            throw "rating with this id not found";
        }
        let oldComments = rate.comments;
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
            throw "could not find comment in rating data";
        }
        const updateInfo = await ratingCollection.updateOne({_id: ObjectId(rID)}, {$set: {comments: oldComments}});
        if (updateInfo.modifiedCount === 0) {
            throw "could not update rating successfully";
        }
        return deleted;
    }
}
