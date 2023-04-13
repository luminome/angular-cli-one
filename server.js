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
app.use(express.static(distDir));

// var staticDir = __dirname + '/static'; //__dirname + "/dist/";
// console.log(__dirname, staticDir);
// app.use(express.static(staticDir));
// Local database URI.
// const REMOTE_DATABASE = "mongodb://localhost:27017/app";
// Local port.

function formatMs(ms, decimals = 2) {
    if (!+ms) return '0 ms';
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['ms', 's', 'm'];
    const scales = [1, 1000, 60000];
    let i = 0;
    if(ms >= 1000) i = 1;
    if(ms >= 60000) i = 2;
    return `${i === 0 ? ms : (ms/scales[i]).toFixed(dm)}${sizes[i]}`;
}

//back in Transaction.

const timer = (var_name) => {
    function start(){
        T.T1 = Date.now();
        return this;
    }
    function stop(){
        T.T2 = Date.now() - T.T1;
        return T.T2;
    }
    const T = {
        var_name: var_name,
        T1: 0.0,
        T2: 0.0,
        start,
        stop
    }
    return T;
}









const LOCAL_PORT = 8080;
const REMOTE_DATABASE = 'mongodb+srv://cluster0.n4fxvug.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority';
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// const fs = require('fs');

const credentials = '/Users/sac/Sites/library/mongo/X509-cert-2850629020587907996.pem' //'<path_to_certificate>'
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
coms_collection = database.collection("coms");


async function runMongoLoader() {
	let container = [];
    let resource_obj_list = [
        {name:'products', part: products_collection}, 
        {name:'products_defs', part: products_defs_collection},
        {name:'coms', part: coms_collection},
    ];

	resource_obj_list.forEach(obj => {
        const count = obj.part.countDocuments({})
		.then(response => {
			obj.size = response;
			return response;
		})
		.catch((error) => {
			console.log(error.status, error);
			return error;
		})
		container.push(count);
	});

	const done = await Promise.all(container);
	resource_obj_list.forEach((obj,i) => obj.count = done[i]);
	return resource_obj_list;
}



const ping_timer = timer('ping_timer').start();
runMongoLoader().then(res=>runServer(res));

function runServer(mongo_data){
    console.log('Express is serving from', distDir);
    mongo_data.forEach(obj => {
        console.log(`Collection-z "${obj.name}" contains (${obj.count}) documents.`);
    });
    console.log(formatMs(ping_timer.stop()));
    // Initialize the app.
    var server = app.listen(process.env.PORT || LOCAL_PORT, function () {
        var port = server.address().port;
        console.log("App now running on port", port);
    });
}



/*  "/api/search"
 *  GET: finds some communications
 */
app.get("/api/search/:term", function (req, res) {
    coms_collection.aggregate([ { 
        $search: {
            index: "coms-text",
            text: {
                query: `${req.params.term}`,
                path: {
                    wildcard: "*"
                }
            }
        }
    } ])
    .sort( { time: -1 } ).toArray().then(response => {
        res.status(200).json(response);
    });
});

/*  "/api/search"
 *  GET: finds some communications
 */
app.get("/api/phrases-short", function (req, res) {
    coms_collection.find({state: "association-phrase"})
    .sort( { time: -1 } ).toArray().then(response => {
        response = response.map((r) => r.object?[r.text, r.object.products?.map((p) => p[1])].join('-'):null)
        .filter((r) => r !== null);
        res.status(200).json(response);
    });
});


app.get("/api/product-local-ids", function (req, res) {
    products_collection.find({}).toArray().then(response => {
        response = response.map((r) => r.id?[r._id,r.int,r.id,r.name,r.brand].join(' '):null)
        .filter((r) => r !== null);
        res.status(200).json(response);
    });
});

app.get("/api/coms-x-product/:localId", function (req, res) {
    // sweet baby jesus. {from_id: req.params.localId},
    ping_timer.start();

    coms_collection.find({$or:[
        {'from_id': req.params.localId},
        {'object.products':{$elemMatch:{$elemMatch:{$in:[req.params.localId]}}}}
    ]})
    .sort( { time: -1 } ).toArray().then(response => {
        const ca = {'phrases':[],'system':[]};
        response.forEach((r) => (r.state === "association-phrase" && ca.phrases.push(r)) || (ca.system.push(r)))
        ca.time = formatMs(ping_timer.stop());
        res.status(200).json(ca);
    });
});



// //db.stores.find( { $text: { $search: "java coffee shop" } } )
// [
//     {
//       $search: {
//         index: "coms-text",
//         text: {
//           query: req.params.term,
//           path: {
//             wildcard: "*"
//           }
//         }
//       }
//     }
//   ]

/*  "/api/coms"
 *  GET: finds all communications
 */
app.get("/api/coms", function (req, res) {
    coms_collection.find({}).sort( { time: -1 } ).limit(50).toArray().then(response => {
        res.status(200).json(response);
    });
});

/*  "/api/coms"
 *  GET: finds all products
 */
app.post("/api/coms", function (req, res) {
    var com = req.body;
    coms_collection.insertOne(com)
    .then(response => {
        res.status(200).json(response.product);
    });
});




/*  "/api/status"
 *   GET: Get server status
 *   PS: it's just an example, not mandatory
 */
app.get("/api/status", function (req, res) {
    var ip = req.headers;//['x-forwarded-for'].split(',')[0];
    res.status(200).json({ status: "UP", ip:ip });
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


/*  "/api/modify/:id"
 *   POST: modifies product and definition by id
 */
app.post("/api/modify/:id", function (req, res) {
    var product = req.body;
    const def_entry = {'name':product.name,'definition':product.def};
    delete product.def;
    product._id = new ObjectId(req.params.id);
    products_collection.replaceOne({_id: new ObjectId(req.params.id)}, product)
    .then(response => {
        def_entry._id = new ObjectId(req.params.id);
        return {product:response, definition:products_defs_collection.replaceOne({_id: new ObjectId(req.params.id)}, def_entry)}
    })
    .then(response => {
        res.status(200).json(response.product);
    });
});


/*

db.collection.bulkWrite( [
   { updateOne :
      {
         "filter": <document>,
         "update": <document or pipeline>,            // Changed in 4.2
         "upsert": <boolean>,
         "collation": <document>,                     // Available starting in 3.4
         "arrayFilters": [ <filterdocument1>, ... ],  // Available starting in 3.6
         "hint": <document|string>                    // Available starting in 4.2.1
      }
   }
] )

*/
            // updateOne : {
            //     "filter": {_id: new ObjectId(r._id)}
            //     "update": {$set:{["children"]: r.children, ["children"]: r.children}}
            //     products_collection.updateOne({_id: new ObjectId(req.params.id)}, {$set:{["children"]: r.children}})

app.post("/api/set-assoc", function (req, res) {
    var bulk = req.body; //array of parts
    const write_groups = [];
    bulk.map((r)=>{
        r._id = new ObjectId(r._id);
        const job = {
            replaceOne :{
                "filter": {_id: new ObjectId(r._id)},
                "replacement": r
            }
        }
        write_groups.push(job);
    })
    products_collection.bulkWrite(write_groups)
    .then(response => {
        res.status(200).json(response);
    });


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
        products_collection.deleteOne({ _id: new ObjectId(req.params.id) })
        .then(response => {
            return products_defs_collection.deleteOne({ _id: new ObjectId(req.params.id) })
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

