"use strict";

let express = require("express");
let app = express();

let mongoUtil = require('./mongoUtil');
mongoUtil.connect();

app.use( express.static(__dirname + "/../client") );

let bodyParser = require("body-parser");
let jsonParser = bodyParser.json();

app.get("/sports", (request, response) => {
  let sports = mongoUtil.sports();
  //console.log(sports + "THESE ARE THE SPORTS");
  sports.find().toArray((err, docs) => {
    //console.log(JSON.stringify(docs));
    if(err) {
      response.sendStatus(400);
    }
    let sportNames = docs.map((sport) => sport.name);
    response.json( sportNames );
  });
});

app.get("/sports/:name", (request, response) => {
  let sportName = request.params.name;

  let sports = mongoUtil.sports();
  sports.find({name: sportName}).limit(1).next((err, doc) => {
    if(err) {
      response.sendStatus(400);
    }
    console.log( "sport doc: ", doc );
    response.json(doc);
  });
});

app.post("/sports/:name/medals", jsonParser, (request, response) => {
  let sportName = request.params.name;
  let newMedal = request.body.medal || {};

  if(!newMedal.division || !newMedal.year || !newMedal.country){
    response.sendStatus(400);
  }

  let sports = mongoUtil.sports();
  let query = {name: sportName};
  let update = {$push: {goldMedals: newMedal}};

  //something in fineOneAndUpdate is causing node server to crash when using curl to test
    // /Users/CentralControl/Documents/lc101/OlympicsMEAN/node_modules/mongodb/lib/utils.js:123
    //   process.nextTick(function() { throw err; });
    //                           ^

    // Error: Can't set headers after they are sent.
    //     at ServerResponse.setHeader (_http_outgoing.js:371:11)
    //     at ServerResponse.header (/Users/CentralControl/Documents/lc101/OlympicsMEAN/node_modules/express/lib/response.js:725:10)
    //     at ServerResponse.contentType (/Users/CentralControl/Documents/lc101/OlympicsMEAN/node_modules/express/lib/response.js:558:15)
    //     at ServerResponse.sendStatus (/Users/CentralControl/Documents/lc101/OlympicsMEAN/node_modules/express/lib/response.js:346:8)
    //     at sports.findOneAndUpdate (/Users/CentralControl/Documents/lc101/OlympicsMEAN/server/app.js:55:14)
    //     at handleCallback (/Users/CentralControl/Documents/lc101/OlympicsMEAN/node_modules/mongodb/lib/utils.js:120:56)
    //     at /Users/CentralControl/Documents/lc101/OlympicsMEAN/node_modules/mongodb/lib/collection.js:2484:14
    //     at handleCallback (/Users/CentralControl/Documents/lc101/OlympicsMEAN/node_modules/mongodb/lib/utils.js:120:56)
    //     at /Users/CentralControl/Documents/lc101/OlympicsMEAN/node_modules/mongodb/lib/db.js:313:5
    //     at /Users/CentralControl/Documents/lc101/OlympicsMEAN/node_modules/mongodb-core/lib/connection/pool.js:461:18
  sports.findOneAndUpdate(query, update, (err, res) => {
    if(err){
      response.sendStatus(400);
    }
    response.sendStatus(201);
  });
});


app.listen(8181, () => console.log("listening on 8181"));
