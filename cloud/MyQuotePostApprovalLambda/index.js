'use strict';
const aws = require('aws-sdk');
const stepfunctions = new aws.StepFunctions();

const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

exports.handler = (event, context, callback) => {
    console.log('Event Starting Event string=' + JSON.stringify(event));
    //console.log('event='+JSON.stringify(event, null, 2));
    var input = JSON.parse(JSON.stringify(event).trim());
    
    var quoteid = input.quoteid;
    console.log('quoteid = ' + quoteid);

      var status ="";
    //update
    if(input.action.toString() === 'approve')
    {
      status = "approved";
    }
    else //Reject
    {
      status = "rejected";
    }
    
    //Update Status
    var params = {
    TableName:tableName,
    Key:{
        "id": quoteid
    },
    UpdateExpression: "set quote_status = :status",
    ExpressionAttributeValues:{
        ":status":status
    },
    ReturnValues:"UPDATED_NEW"
  };

console.log("Updating the item...");
dynamo.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
});

  //});
    console.log('Completed');
    //console.log('activityArn'+context+'output= '+input);
    //callback(null, "Promo# "+ input.quoteid+ " is approved");
    callback(null, "Quote# "+ quoteid + " is approved");
}