var Alexa = require('alexa-sdk');
const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;
const https = require('https');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);


    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetNewFactIntent');
    },

    /*
    'GetNewFactIntent': function () {
        var say = 'Hello Manoj! Lets begin!' + getFact();
        this.emit(':tell', say );
    },
    */
    'GetNewFactIntent': function () {
     getSubmittedQuotes(this);
        //var say = 'Hello Manoj! ' + getSubmittedQuotes(this);
        //this.emit(':tell', say );
    },
    
    'GetSensorData': function () {
     getSensorRelatedData(this);
    },

    'AMAZON.HelpIntent': function () {
         this.emit(':ask', 'Learn everything you need to know about Amazon Web Services to pass your exam by listening to your very own study notes. You can start by saying, Kumar help me study.', 'try again');
     },

     'AMAZON.CancelIntent': function () {
         this.emit(':tell', 'Goodbye Kumar');
     },

     'AMAZON.StopIntent': function () {
         this.emit(':tell', 'Goodbye Kumar');
     }
};

//  helper functions  ===================================================================
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

function getFact() {
    var myFacts = [
    '<audio src=\"https://s3.amazonaws.com/noterepository-mp3/110baec9-a61c-4fd8-aa06-49fd76e88eaf.mp3" />\'',
    '<audio src=\"https://s3.amazonaws.com/noterepository-mp3/83764c46-39ba-4c3b-8493-1e98e4037f84.mp3" />\'',
    '<audio src=\"https://s3.amazonaws.com/noterepository-mp3/68b4bb24-5610-4b90-b6f9-36a67babc363.mp3" />\''
        ]

    var newFact = randomPhrase(myFacts);

    return newFact;
}

function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}

//---------Easy Quote------------
function getSubmittedQuotes(thisval){
    
    var status = "Submitted";
    console.log("db call");
    var params1 = {
     TableName: tableName,
     IndexName: 'quote_status-index',
     KeyConditionExpression: 'quote_status = :quote_status',
     ExpressionAttributeValues: {
        ':quote_status' : 'Submitted'
       }
    };

    var quoteResult;
    console.log('Dynamo db call req'+dynamo+ 'table name='+tableName);


    dynamo.query(params1, function(err, data) {
     console.log('Dynamo db call response');
      if (err) {
        console.log("Error", err);
      } 
      else 
      {
       try {
       console.log('Alexa data output data = '+JSON.stringify(data));
      	console.log("Success temp Query=", data.Items);
        var responsedata = data.Items;
      
        if (responsedata === null || isEmptyObject(responsedata)) {
            console.log('No Quote to create Workflow.');
            quoteResult = " There is no quote to approve at this point of time.";
        }
        else
        {
            quoteResult = " There is ";
            var quotenames = "";
            quoteResult = quoteResult + ' quote list which waiting approve is as: ';
            for (var key in responsedata) {
                console.log('Looping Quote id = '+responsedata[key].id);
                 var quoteid = responsedata[key].id;
                 var quoteDesc = responsedata[key].quote_name;
                 quotenames = quotenames + ' ' + quoteDesc + ',';
            }
            quoteResult = quoteResult + quotenames;
        }
        var say = 'Hello Manoj! ' + quoteResult;
        thisval.emit(':tell', say );
       }
       catch(error) {
         console.error("errot => "+error);
         // expected output: SyntaxError: unterminated string literal
         // Note - error messages will vary depending on browser
         thisval.emit(':tell', 'error' );
       }
      }
    });
  
     console.error("<= done => ");
    //return quoteResult;
}

function getSensorRelatedData(thisval){

 var url = 'https://firestore.googleapis.com/v1beta1/projects/my-project-415-341/databases/(default)/documents/vu-plant-data?orderBy=dateandtime%20Desc';
 https.get(url, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);
  var body = '';
    res.on('data', (d) => {
      body += d;
    });
      res.on('end', function() {
          
         // console.log('len='+length);
          var parsed = JSON.parse(body);
          var length = parsed.documents.length;
          length=1;
          console.log('len='+length);
          /*
          for (var key in parsed.documents) {
            if (parsed.documents.hasOwnProperty(key)) {
              console.log(key + ": " + parsed.documents[key]);
            }
          }*/
          var humidity = parsed.documents[length-1]['fields']['humidity']['integerValue'];
          var moisture = parsed.documents[length-1]['fields']['moisture']['integerValue'];
          var temperature = parsed.documents[length-1]['fields']['temperature']['integerValue'];
          var sensorname = JSON.stringify(parsed.documents[length-1]['fields']['sensorname']['stringValue']);
          let tempval = parseInt(temperature+'');
          let moistval = parseInt(moisture+'');
          console.log("Get if="+tempval+"condi="+(tempval > 80)+'val='+temperature+'.');
          var advice = ' ';
          if(moistval < 50)
          {
            advice = ' I would advice you to water the plant due to low moisture in soil.';
          }
          if(tempval > 80)
          {
            advice = advice+' Temperature is hot here. I would advice you to water the plant to cope with temperature.';
          }
          var say = 'vaseuno app reporting for plant '+sensorname+' humidity at ' + humidity+ ', moisture at '+moisture+', temperature at '+temperature+'.'+ advice+' Thank You.';
          thisval.emit(':tell', say );
          //console.log("data= "+JSON.stringify(body));
      });
  }).on('error', (e) => {
    //console.error(e);
    thisval.emit(':tell', 'vaseuno, Error in getting humidity' );
  });
        
}
