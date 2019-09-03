var mongoose = require('mongoose');

const username = 'Incom'
const password = 'azerty'
const urlMongo = 'mongodb+srv://'+ username + ':'+ password +'@incom-qnema.mongodb.net/tictactrip'

var options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true
}
mongoose.connect(urlMongo,
  options,
  
   function (err) {
    if (err) {
    console.log(err);
  }
  else {
    console.log("=====> Connection MongoDB OK");
  }
}
);

module.exports = mongoose;