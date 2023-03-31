// Use Express
var express = require("express");
// Use body-parser
var bodyParser = require("body-parser");


const loader = require('./request');
// Use MongoDB
// var mongodb = require("mongodb");
// var ObjectID = mongodb.ObjectID;
// The database variable
var database;
var collection;
// The products collection
var words_COLLECTION = "products";


// Create new instance of the express server
var app = express();

// Define the JSON parser as a default way 
// to consume and produce data through the 
// exposed APIs
app.use(bodyParser.json());

app.set('json spaces', 2);

// Create link to Angular build directory
// The `ng build` command will save the result
// under the `dist` folder.
var distDir = __dirname + '/dist/angular-cli-one'; //__dirname + "/dist/";
console.log(__dirname, distDir);
app.use(express.static(distDir));

var staticDir = __dirname + '/static'; //__dirname + "/dist/";
console.log(__dirname, staticDir);
app.use(express.static(staticDir));
// Local database URI.
// const REMOTE_DATABASE = "mongodb://localhost:27017/app";
// Local port.
const LOCAL_PORT = 8080;
const REMOTE_DATABASE = 'mongodb+srv://cluster0.n4fxvug.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority';
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// var ObjectId = ObjectID;

const fs = require('fs');

const credentials = '/Users/sac/Sites/library/mongo/X509-cert-7010500130319648579.pem' //'<path_to_certificate>'


const client = new MongoClient('mongodb+srv://cluster0.n4fxvug.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority', {
  sslKey: credentials,
  sslCert: credentials,
  serverApi: ServerApiVersion.v1,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

client.connect();
database = client.db("app");
products_collection = database.collection("products");
products_defs_collection = database.collection("product_def");

const docCount = products_collection.countDocuments({});
console.log('docCount', docCount);
console.log("Database connection started.");

/*  "/api/status"
 *   GET: Get server status
 *   PS: it's just an example, not mandatory
 */
app.get("/api/status", function (req, res) {
    res.status(200).json({ status: "UP" });
});

/*  "/api/products"
 *  GET: finds all products
 */
app.get("/api/products", function (req, res) {
    const cursor = products_collection.find({}).toArray().then(response => {
        res.status(200).json(response);
    });
});

/*  "/api/products"
 *   POST: creates a new product
 */
app.post("/api/products", function (req, res) {
    var product = req.body;
    //top two here are vestigial fallbacks
    if (!product.name) {
        manageError(res, "Invalid product input", "Name is mandatory.", 400);
    } else if (!product.brand) {
        manageError(res, "Invalid product input", "Brand is mandatory.", 400);
    } else {
        const def_entry = {'name':product.name,'definition':product.def};
        delete product.def;
        products_collection.insertOne(product)
        .then(response => {
            delete product.def;
            def_entry._id = response.insertedId;
            return {product:response, def:products_defs_collection.insertOne(def_entry)}
        })
        .then(response => {
            product._id = response.product.insertedId;
            res.status(200).json(product);
        });
    }
});

/*  "/api/products/:id"
 *   POST: updates product by id
 */
app.post("/api/products/:id", function (req, res) {
    var update = req.body;
    const v = update.value;
    const cursor = products_collection.updateOne({_id: new ObjectId(req.params.id)}, {$set:{[update.key]: v}})
    .then(response => {
        res.status(200).json(response);
    });
});


/*  "/api/lookup/:word"
 *   GET: word definition from api
 */
app.get("/api/lookup/:word", function (req, res) {
    const cursor = products_defs_collection.find({'name':req.params.word}).toArray().then(response => {
        res.status(200).json(response);
    });
});

/*  "/api/define/:word"
 *   GET: word definition from api
 */
app.get("/api/define/:word", function (req, res) {
    const payload = [{
        'type':'json',
        'time': new Date(),
        'url':`https://api.dictionaryapi.dev/api/v2/entries/en/${req.params.word}`
    }];
    loader(payload).then(result => res.status(200).json(result));
});



/*  "/api/products/:id"
 *   DELETE: deletes product by id
 */
app.delete("/api/products/:id", function (req, res) {
    if (req.params.id.length > 24 || req.params.id.length < 24) {
        manageError(res, "Invalid product id", "ID must be a single String of 12 bytes or a string of 24 hex characters.", 400);
    } else {
        products_defs_collection.deleteOne({ _id: new ObjectId(req.params.id) })
        .then(response => {
            return products_collection.deleteOne({ _id: new ObjectId(req.params.id) })
        })
        .then(response => {
            res.status(200).json(response);
        });
    }
});

// Errors handler.
function manageError(res, reason, message, code) {
    console.log("Error: " + reason);
    res.status(code || 500).json({ "error": message });
}


  
// run().catch(console.dir);
// console.log('what');


// Initialize the app.
var server = app.listen(process.env.PORT || LOCAL_PORT, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});