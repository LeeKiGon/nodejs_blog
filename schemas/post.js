const mongoose = require("mongoose"); //mongodb 사용

const postSchema = mongoose.Schema({ //schema 생성
    
    // postId: {
    //     type: Number,   //타입
    //     unique: true    //유니크값(고유값) 겹치는값이 없어야한다.
    // },
    title: {
        type: String,
        required: true, //필수값
    },
    name: {
        type: String,
        required: true,
    },
    pw: {
        type: String,
    },
    memo: {
        type: String,
    },
    Date: {
        type: Date,
        default: new Date
    }    
});


module.exports = mongoose.model("Post", postSchema); // 모델이름은 "Post", postSchema(위치)에서 사용