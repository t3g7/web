var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

var api = "http://localhost:8081";

app.get('/', function(req, res) {
    res.sendfile("./public/index.html");
});

app.listen(8081);
