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
                    res.body[0].should.have.property('_id');
                    res.body[0].should.have.property('name');
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
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.name.should.equal('kale');
                    done();
                });
        });
        it('should fail and return a 403 and error message if item name already exists', function(done) {
            chai.request(app)
                .post('/items')
                .send({'name': 'bananas'})
                .end(function(err, res) {
                    should.not.equal(err, null);
                    res.should.have.status(403);
                    res.should.be.json;
                    res.body.should.have.property('message');
                    res.body.message.should.equal('Item name already exists');
                    done();
                });
        });
    }), // end POST
    describe('put', function() {
        it('should fail and return a 404 if request does not have item name', function(done) {
            chai.request(app)
                .get('/items')
                .end(function(err, res){
                    chai.request(app)
                        .put('/items')
                        .send({'_id': res.body[1]._id})
                        .end(function(err, res) {
                            res.should.not.equal(null);
                            res.should.have.status(404);
                            res.should.be.json;
                            res.body.should.have.property('message');
                            res.body.message.should.equal('Db request did not include item name');
                            done();
                        });
                });
        });
        it('should edit an item on PUT', function(done) {
            chai.request(app)
                .get('/items')
                .end(function(err, res){
                    chai.request(app)
                        .put('/items')
                        .send({'_id': res.body[0]._id, 'name': 'pizza'})
                        .end(function(error, res) {
                            should.equal(err, null);
                            res.should.have.status(201);
                            res.should.be.json;
                            res.body.should.have.property('name');
                            res.body.name.should.equal('pizza');
                            done();
                         });
                });
        });
    }), // end PUT
    describe('delete', function() {

        it('should fail and return 404 if item does not exist at endpoint specified', function(done) {
            chai.request(app)
                .delete('/items/000zz0000z00z00z0zz00zzz')
                .end(function(err, res) {
                    should.not.equal(err, null);
                    res.should.have.status(404);
                    res.should.be.json;
                    res.body.should.have.property('message');
                    res.body.message.should.equal('Item does not exist');
                   done();
                });
        });
        it('should delete an item', function(done) {
            chai.request(app)
                .get('/items')
                .end(function(err, res){
                    chai.request(app)
                    .delete('/items/'+res.body[0]._id)
                    .end(function(err, res) {
                        should.equal(err, null);
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Delete successful');
                        done();
                    });
                });
        });
    });
});
