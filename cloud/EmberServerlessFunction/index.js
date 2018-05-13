/*
* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
* Licensed under the Amazon Software License (the "License").
* You may not use this file except in compliance with the License.
* A copy of the License is located at
*
*   http://aws.amazon.com/asl/
*
* or in the "license" file accompanying this file. This file is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied.
* See the License for the specific language governing permissions and limitations
* under the License.
*/
'use strict';
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

const createResponse = (statusCode, body) => {
    return {
        'statusCode': statusCode,
        'body': body
    }
};

const getMethod = (user, event, context, callback) => {
    let params = {
        'TableName': tableName
    }, id = event.params.querystring.id, dbGet = {};
    if (id) {
        params.Key = {
            'id': id
        }
        dbGet = (params) => { return dynamo.get(params).promise() };
    } else {
        dbGet = (params) => { return dynamo.scan(params).promise() };
    }
    dbGet(params).then( (data) => {
        if (id && !data.Item) {
            callback(null, createResponse(404, "ITEM NOT FOUND"));
            return;
        } else if (id && data.Item) {
            console.log(`RETRIEVED ITEM SUCCESSFULLY WITH doc = ${data.Item.doc}`);
            callback(null, createResponse(200, data.Item.doc));
        } else {
            console.log('SCANNING TABLE');
            callback(null, createResponse(200, data.Items));
        }
        
    }).catch( (err) => { 
        console.log(`GET ITEM FAILED FOR doc = ${data.Item.doc}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err));
    });
};

const putMethod = (user, event, context, callback) => {
    if (!event['body-json'] || !event['body-json'].quote_name) {
        callback(null, createResponse(500, 'No Quote found in body'));
        return;
    }

    let quote_name = event['body-json'].quote_name,
        approved_date = event['body-json'].approved_date,
        comment = event['body-json'].comment,
        date_requested = event['body-json'].date_requested,
        product_approved_by = event['body-json'].product_approved_by,
        product_approved_price = event['body-json'].product_approved_price,
        product_requested_price = event['body-json'].product_requested_price,
        product_to_buy = event['body-json'].product_to_buy,
        quote_status = event['body-json'].quote_status,
        customer = event['body-json'].customer,
        requested_by = event['body-json'].requested_by,
        valid_from = event['body-json'].valid_from,
        valid_to  = event['body-json'].valid_to,
        token = event['body-json'].token,
        item = {
              'id': event.context['request-id'],
              /*'approved_date': approved_date,*/
              'comment': comment,
              'date_requested': date_requested,
              /*'product_approved_by': product_approved_by,*/
              /*'product_approved_price': product_approved_price,*/
              'product_requested_price': product_requested_price,
              'product_to_buy': product_to_buy,
              'quote_name': quote_name,
              'quote_status': quote_status,
              'customer':customer,
              /*'token': token,*/
              'requested_by': requested_by,
              'valid_from': valid_from,
              'valid_to': valid_to
            /*'user': user*/
        },
        params = {
            'TableName': tableName,
            'Item': item
        };
        
        /*for(var itemKey in params.Item) {
            for(var itemAttr in params.Item[itemKey]) {
            var value = params.Item[itemKey][itemAttr];
            if(value === undefined || value === "") {
                params.Item[itemKey][itemAttr] = null;
                console.log("item", itemKey, "of type", itemAttr, "is undefined!")
            }
          }
        }*/
        console.log('manoj save item=: ', JSON.stringify(item, null, 2));
        

    let dbPut = (params) => { return dynamo.put(params).promise() };
    
    dbPut(params).then( (data) => {
        console.log(`PUT ITEM SUCCEEDED WITH doc = ${item.doc}`);
        callback(null, createResponse(200, item));
    }).catch( (err) => { 
        console.log(`PUT ITEM FAILED FOR doc = ${item.doc}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err)); 
    });
    
};

const deleteMethod = (user, event, context, callback) => {
    if (!event['body-json'].id) {
        callback(500, { 'errorMessage': 'No id specified' });
    }
    let id = event['body-json'].id,
        params = {
            'TableName': tableName,
            'Key': {
                'id': id
            },
            'ReturnValues': 'ALL_OLD'
        };
    let dbDelete = (params) => { return dynamo.delete(params).promise() };
    dbDelete(params).then( (data) => {
        if (!data.Attributes) {
            callback(null, createResponse(404, "ITEM NOT FOUND FOR DELETION"));
            return;
        }
        console.log(`DELETED ITEM SUCCESSFULLY WITH id = ${event.pathParameters.resourceId}`);
        callback(null, createResponse(200,data));
    }).catch( (err) => { 
        console.log(`DELETE ITEM FAILED FOR id = ${event.pathParameters.resourceId}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err));
    });
};

exports.handler = (event, context, callback) => {
    console.log('Ember Serverless API Event: ', event);
    console.log('Ember Serverless Context: ', context);
    let user = event.context.email;
    console.log('Ember Serverless User: ', user);
    console.log('HTTP Method: ', event.context.httpMethod);
    switch ( event.context.httpMethod ) {
        case 'GET':
            getMethod(user,event,context,callback);
            break;
        case 'PUT':
        case 'POST':
            putMethod(user,event,context,callback);
            break;
        case 'DELETE':
            deleteMethod(user,event,context,callback);
            break;
        default:
            callback(null, createResponse(500, 'Unsupported Method: ' + context.httpMethod));
            break;
    }    
};