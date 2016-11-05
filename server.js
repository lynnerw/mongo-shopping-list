var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config.js');

var app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

var runServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }
        app.listen(config.PORT, function() {
            console.log('listening on localhost: ' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

var Item = require('./models/item');

app.get('/items', function(req, res) {
    Item.find(function(err, items) {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.json(items);
    });
});

app.post('/items', function(req, res) {
    Item.create({
        name: req.body.name
    }, function(err, item) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        res.status(201).json(item);
    }); 
});

app.put('/items/:id', function(req, res) {
    console.log(req.params.id + ' ' + req.body.name);
    Item.findOneAndUpdate({
        _id: req.params.id
        }, 
        {$set:{name:req.body.name}},
        function(err, item) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error; name is ' + req.body.name});
        }
        res.status(201).json(item);
    });
});

app.delete('/items/:id', function(req, res) {
    Item.remove({
        _id: req.params.id
    }, function(err, item) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        res.status(201).json(item);
    });
});

app.use('*', function(req, res) {
    res.status(404).json({message: 'Not Found'});
});

if (require.main === module) {
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
}

exports.app = app;
exports.runServer = runServer;