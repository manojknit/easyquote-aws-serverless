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
import Ember from 'ember';

export default Ember.Controller.extend({
	cognito: Ember.inject.service(),
	authentication: Ember.inject.service(),
	jwt: Ember.computed('authentication', function() {
		var token = this.get('authentication').get('token');
		return window.jwt_decode(token);
	}),
	user: Ember.computed('cognito', function() {
		return this.get('cognito').get('user');
	}),
	actions: {
		createItem() {
			/* let content = this.get('item');
			if (!content) {
				return alert('Please enter some content');
      } */
      let quote_name = this.get('quote_name');
			if (!quote_name) {
				return alert('Please enter some quote name.');
      }
      let product_to_buy = this.get('product_to_buy');
			if (!product_to_buy) {
				return alert('Please enter product to buy.');
      }
      let product_requested_price = this.get('product_requested_price');
			if (!product_requested_price) {
				return alert('Please enter product requested price.');
      }
      let customer = this.get('customer');
			if (!customer) {
				return alert('Please enter customer.');
      }
      let valid_from = this.get('valid_from');
			if (!valid_from) {
				return alert('Please enter valid from.');
      }
      let valid_to = this.get('valid_to');
			if (!valid_to) {
				return alert('Please enter valid to.');
      }
      //if RSM
      let requested_by = this.get('cognito').get('user').username;
      let quote_status = 'Submitted';
      let date_requested = Date();
      //let requested_by = user;
      //else
      let approved_date = Date();
      let product_approved_price = this.get('product_requested_price');
      let product_approved_by = this.get('cognito').get('user').username;

      let comment = this.get('comment');
      let token = '';


			let	doc = this.get('store').createRecord('doc', {
        'approved_date': approved_date,
        'comment': comment,
        'date_requested': date_requested,
        'product_approved_by': product_approved_by,
        'product_approved_price': product_approved_price,
        'product_requested_price': product_requested_price,
        'product_to_buy': product_to_buy,
        'quote_name': quote_name,
        'quote_status': quote_status,
        'customer':customer,
        'token': token,
        'requested_by': requested_by,
        'valid_from': valid_from,
        'valid_to': valid_to
				});
			doc.save()
				.then(function(data) {
					Ember.Logger.info(data);
				})
				.catch(function(error) {
					Ember.Logger.error(error);
					doc.deleteRecord();
				});
		},
		removeItem(id) {
			if (confirm('Remove this item?')) {
				this.get('store').findRecord('doc', id, { backgroundReload: false })
					.then(function(doc) {
						doc.deleteRecord();
						doc.save();
					})
					.catch(function(err) {
						Ember.Logger.error(err);
					});
			}
		},
		logout() {
			var ctrl = this;
			this.get('authentication').logout()
				.then(function() {
					ctrl.transitionToRoute('/login');
				});
		}
	}
});
