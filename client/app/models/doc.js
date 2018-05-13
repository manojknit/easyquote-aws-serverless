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
import DS from 'ember-data';
import attr from 'ember-data/attr';
import date from 'ember-data/transforms/date';

/**
 * This local model coorisponds to items
 * within the DynamoDB table. If more properties
 * are added, the model needs to have the attributes
 * defined here in order for them to be exposed
 * in view templates
 */
export default DS.Model.extend({
              approved_date: attr('date'),
              comment: attr('string'),
              date_requested: attr('date'),
              product_approved_by: attr('string'),
              product_approved_price: attr('string'),
              product_requested_price: attr('number'),
              product_to_buy: attr('string'),
              quote_name: attr('string'),
              quote_status: attr('string'),
              customer:attr('string'),
              token: attr('string'),
              requested_by: attr('string'),
              valid_from: attr('date'),
              valid_to: attr('date')
});

isApproved: Ember.computed('quote_status', function() {
  return this.get('quote_status') != "approved";
})
