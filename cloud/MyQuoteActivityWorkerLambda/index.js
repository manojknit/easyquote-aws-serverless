'use strict';
console.log('Loading worker function');
//var request = require('xhr-request');
const aws = require('aws-sdk');
const stepfunctions = new aws.StepFunctions();
const ses = new aws.SES();
const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

exports.handler = (event, context, callback) => {
    

//Create Step Function instance - Start
//var API_Key = process.env.MONGO_API_KEY;
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

dynamo.query(params1, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
  	console.log("Success temp Query=", data.Items);
    //data.Items.forEach(function(element, index, array) {
      //console.log(element.Title.S + " (" + element.Subtitle.S + ")");
    //});
            var responsedata = data.Items;
            if (responsedata === null || isEmptyObject(responsedata)) {
                console.log('No Quote to create Workflow.');
            }
            else
            {
                for (var key in responsedata) {
                    console.log('Looping Quote id = '+responsedata[key].id);
                  //if (responsedataobj.hasOwnProperty(key)) {
                      var quoteid = responsedata[key].id;
                      var quoteDesc = responsedata[key].quote_name;
                      var emailIds = 'manojsjsu@gmail.com';
                      var inputToStepFunc = "{ \"quoteid\": \"" + quoteid + "\", \"quoteName\" : \"" + quoteDesc + "\", \"managerEmailAddress\" : \"" + emailIds + "\" }";
                      var nameunique = quoteid + "_WF";
                      var workflowParams = {
                        stateMachineArn: 'arn:aws:states:us-east-1:494875521123:stateMachine:MyQuoteApprovalWorkFlow',
                        input: inputToStepFunc, name: nameunique
                    };
                      stepfunctions.startExecution(workflowParams, function(err, data) {
                        if (err) {
                            console.log(err, err.stack);
                            console.log('An error occured in starting workflow for QuoteId= '+quoteid);
                        } else {
                                // No activities scheduled
                                console.log('Started workflow for Quote= '+quoteid+" data= "+data);
                            }
                      });
                }
            }
  }
});

console.log("Work Flow Creation check. Sending email. If required");

//Email send
    var taskParams = {
        activityArn: 'arn:aws:states:us-east-1:494875521123:activity:MyQuotePMApprovalStep'
    };
    
    stepfunctions.getActivityTask(taskParams, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            context.fail('An error occured in calling getActivityTask.');
        } else {
            if (data === null || isEmptyObject(data)) {
                console.log('Step function data is Null')
                // No activities scheduled
                context.succeed('No activities received after 60 seconds.');
            } else {
                console.log('Step function data is not Null')
                console.log('Step function data output data = '+JSON.stringify(data));
                var input = JSON.parse(data.input);
                var emailParams = {
                    Destination: {
                        ToAddresses: [
                            input.managerEmailAddress
                            ]
                    },
                    Message: {
                        Subject: {
                            Data: 'MyQuote: Your Approval Needed for QuoteId# '+ input.quoteid,
                            Charset: 'UTF-8'
                        },
                        Body: {
                            Html: {
                                Data: 'Hi!<br />' +
                                    input.quoteName + ' requires your approval!<br />' +
                                    'Can you please approve:<br />' +
                                    'https://rivi7zpw05.execute-api.us-east-1.amazonaws.com/respond/approve?taskToken=' + encodeURIComponent(data.taskToken) + "&quoteid=" + input.quoteid + '<br />' +
                                    'Or reject:<br />' +
                                    'https://rivi7zpw05.execute-api.us-east-1.amazonaws.com/respond/reject?taskToken=' + encodeURIComponent(data.taskToken)+ "&quoteid=" + input.quoteid,
                                Charset: 'UTF-8'
                            }
                        }
                    },
                    Source: input.managerEmailAddress,
                    ReplyToAddresses: [
                            input.managerEmailAddress
                        ]
                };
                    
                ses.sendEmail(emailParams, function (err, data) {
                    if (err) {
                        console.log(err, err.stack);
                        context.fail('Internal Error: The email could not be sent.');
                    } else {
                        console.log(data);
                        context.succeed('The email was successfully sent.');
                    }
                });
            }
        }
    });





};