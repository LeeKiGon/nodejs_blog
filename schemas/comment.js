const mongoose = require("mongoose"); //mongodb 사용
    
const commentSchema = mongoose.Schema({//schema 생성
    commentnick : {
        type: String,
    },
    comment : {
        type: String,
    },
    Date: {
        type: Date,
        default: new Date
    },
    id : {
        type: String,
    }
});

module.exports = mongoose.model("Comment", commentSchema); // 모델이름은 "Post", postSchema(위치)에서 사용