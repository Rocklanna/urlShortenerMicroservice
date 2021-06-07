require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const url = require('url');

//mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());


// Basic Configuration
const port = process.env.PORT || 3000;


// create a Schema

const urlSchema = new mongoose.Schema({
  original_url: {type:String,required:true},
  short_url:{type:String,required:true}
});

var saveUrl = mongoose.model("saveUrl",urlSchema);


/*const createandsaveurl =function(data,done){
  
  saveUrl.create(data,function(err,saved){
    if(err){
      console.log(err);
    }
    done(null,saved);
  })
}
*/
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl/new",function(req,res){
  
  //var newurl = "/api/shorturl/";
  const regex = /^((https?:\/\/){1})/g;
  var inputurl = req.body.url;
  var checkip;
  var error;
  const theurl = new URL(inputurl);

  
   dns.lookup(theurl.hostname,function(err,addresses){
    
    if(err){
   return  res.json({"error":"Hostname not found"});
  }
   
    else{
  
       
  if(regex.test(theurl.origin)){
    
      //const noHTTPSurl = inputurl.replace(/^https?:\/\//, '');
    
    saveUrl.find({original_url:inputurl},function(err,foundurl){
      
      // return res.json({short_url:foundurl});
     if(foundurl.length>0){ // url already exists in database
       
        return res.json({original_url:inputurl,short_url:foundurl[0]["short_url"]});
      }
      
     else{
            
    
    var shorturl = (Math.random()*101).toString(32).substring(3,5) + (Math.random()*101).toString(32).substring(3,5);
   // var newurl = newurl.concat(shorturl);
    var toDBUrl ={original_url:inputurl,short_url:shorturl};
    
   
    var myData = new saveUrl (toDBUrl);
    
myData.save()
    .then(item => {
      res.send("item saved to database");
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
    });
    
    
    res.json({"original_url":inputurl,"short_url":shorturl});   
      }
    })

  } // end of if url is in the accepted format
  
  else{
     res.json({"error":"invalid url"});
    
    
  }// end of inner else
  
  
 
  } // outer else
         
  }) // end dns lookup
  

  
  //Test that URL is valid
  
      
 }); // end of post function


// redirect short url
app.get("/api/shorturl/:short_url",function(req,res){
  
  var shorturl = req.params.short_url;
  
  saveUrl.find({short_url:shorturl},function(err,foundurl){
    if(foundurl.length>0){
      return  res.redirect(foundurl[0]["original_url"]);
    }
    else{
     res.send("Provided Url does not exist");
    }
  })
 
 
  
})




// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


//exports.createandsaveurl = createandsaveurl;
