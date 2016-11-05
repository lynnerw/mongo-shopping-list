global.DATABASE_URL = 'mongodb://localhost/shopping-list-test';

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../server.js');
var Item = require('../models/item');

var should = chai.should();
var app = server.app;

chai.use(chaiHttp);

describe('Shopping List', function() {
    before(function(done) {
        server.runServer(function() {
            Item.create({name: 'bananas'},
                        {name: 'tomatoes'},
                        {name: 'arugula'}, 
                        function() {
                            done();
                        });
        });
    });
    after(function(done) {
        Item.remove(function() {
            done();
        });
    }); 
    describe('get', function() {
        it('should list items on GET', function(done) {
            chai.request(app)
                .get('/items')
                .end(function(err,res) {
                    should.equal(err, null);
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('array');
                    res.body.should.have.length(3);
                    res.body[0].should.be.a('object');
                    res.body[0].should.have.property('id');
                    res.body[0].should.have.property('name');
                    res.body[0].id.should.be.a('number');
                    res.body[0].name.should.be.a('string');
                    res.body[0].name.should.equal('bananas');
                    res.body[1].name.should.equal('tomatoes');
                    res.body[2].name.should.equal('arugula');
                    done();
                });
        });
    }); // end GET
    describe('post', function() {
        it('should add an item', function(done) {
            chai.request(app)
                .post('/items')
                .send({'name': 'kale'})
                .end(function(err, res) {
                    should.equal(err, null);
                    res.should.have.status(201);
                    storage.items.should.have.length(4);
                    done();
                });
        });
        it('should fail and return a message if request.body.name does not exist', function(done) {
            chai.request(app)
                .post('/items')
                .send({})
                .end(function(err, res) {
                    should.not.equal(err, null);
                    res.should.have.status(400);
                    res.body.should.have.property('status');
                    res.body.status.should.equal('Failed: item name missing');
                    done();
                });
        });
        it('should fail and return a message if item name already exists', function(done) {
            chai.request(app)
                .post('/items')
                .send({'name': 'bananas'})
                .end(function(err, res) {
                    should.not.equal(err, null);
                    res.should.have.status(400);
                    res.body.should.have.property('status');
                    res.body.status.should.equal('Failed: item name already exists');
                    done();
                });
        });
    }), // end POST
    describe('put', function() {
        it('should edit an item on PUT', function(done) {
            chai.request(app)
                .put('/items/3')
                .send({'name':'pizza','id': 3})
                .end(function(err, res) {
                    console.log(res);
                    should.equal(err, null);
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('status');
                    res.body.status.should.equal('Update successful');
                    done();
                });
        });
        it('should fail and return a 404 if item name is missing', function(done) {
            chai.request(app)
                .put('/items/2')
                .send({'id': 2})
                .end(function(err, res) {
                    res.should.not.equal(null);
                    res.should.have.status(404);
                    done();
                });
        });
        it('should fail and return message if request ID does not equal endpoint ID', function(done) {
            chai.request(app)
                .put('/items/3')
                .send({'name':'bananas','id': 1})
                .end(function(err, res) {
                    res.should.not.equal(null);
                    res.should.have.status(400);
                    res.body.should.have.property('status');
                    res.body.status.should.equal('Failed: wrong endpoint or id');
                    done();
                });
        });
    }), // end PUT
    describe('delete', function() {
        it('should delete an item', function(done) {
            chai.request(app)
                .delete('/items/3')
                .end(function(err, res) {
                    should.equal(err, null);
                    res.should.have.status(200);
                    res.should.be.json;
                    res.should.be.a('object');
                    res.body.should.have.property('status');
                    res.body.status.should.equal('Delete successful');
                    done();
                });
        });
        it('should fail and return message if item does not exist', function(done) {
            chai.request(app)
                .delete('/items/8')
                .end(function(err, res) {
                    should.not.equal(err, null);
                    res.should.have.status(400);
                    res.should.be.json;
                    res.should.be.a('object');
                    res.body.should.have.property('status');
                    res.body.status.should.equal('Delete failed');
                    done();
                });
        });
        it('should fail if endpoint does not contain ID', function(done) {
            chai.request(app)
                .delete('/items/ ')
                .end(function(err, res) {
                    should.not.equal(err, null);
                    res.should.have.status(404);
                    done();
                });
        });
    });
});
