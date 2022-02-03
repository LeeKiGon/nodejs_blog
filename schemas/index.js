const mongoose = require("mongoose"); //mongodb 선언

const connect = () => {
    mongoose.connect("mongodb://localhost:27017/gon", {ignoreUndefined: true  }).catch((err) => { //mongodb 연결(ignoreUndefinde 는 Undefinde로 넘어오는값 무시! )
        console.log(err);
    });
};

module.exports = connect; //모듈 mongode 사용