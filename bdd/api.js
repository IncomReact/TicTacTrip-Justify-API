const mongoose = require('mongoose');

var ApiSchema = mongoose.Schema({
    token: String,
    email: String,
    limit: Number,
    numberWords: Number,
    dateDay: Number,
   });

const ApiModel = mongoose.model('api', ApiSchema);

module.exports = ApiModel;