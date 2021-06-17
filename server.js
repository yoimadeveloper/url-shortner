require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose'); 
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(mongoose.connection.readyState)

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
const Schema = mongoose.Schema

const urlSchema = new Schema({
  original: ({ type: String, required: true}),
  short: Number
})

const Url = mongoose.model("Url", urlSchema)
let resObject = {}
app.post('/api/shorturl/new', function(req, res){
  let inputUrl = req.body['url']

 const checker = dns.lookup(urlparser.parse(inputUrl).hostname,
 (error, address) => {
   if (!address) {
     res.json({ error: 'invalid url'})
   } else {
     const url = new Url({ url: inputUrl})
   }
   console.log("dns", error);
   console.log("address", address);
   console.log("checker", checker);
 }
 )

  resObject["original_url"] = inputUrl

  let inputShort = 1

  Url.findOne({})
  .sort({short: 'desc'})
  .exec((error, result) =>{
    if(!error && result != undefined){
      inputShort = result.short + 1
    } 
    if (!error) {
      Url.findOneAndUpdate(
        {original: inputUrl},
        {original: inputUrl, short: inputShort},
        {new: true, upsert: true},
        (error, savedUrl) => {
          if(!error){
            resObject["short_url"] = savedUrl.short
            res.json(resObject)
          }
        }
      )
    }
  }
  )

})


app.get('/api/shorturl/:input', function(req, res) {
let input = req.params.input

Url.findOne({short: input}, (error, result)=>{
  if(!error && result != undefined){
    res.redirect(result.original)
  } else {
    res.json('URL not found')
  }
})
});




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
