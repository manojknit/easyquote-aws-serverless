
![AWS Architecture Diagram](images/architecture1.png "AWS Architecture")

# Serverless Web Application with approval in Step function on AWS. Alexa Skill to check status.

[A Serverless AWS app. It utilizes a fully serverless architecture:

 - Cognito User Pools for authentication, registration, and confirmation
 - API Gateway for REST API authenticated with Cognito User Pools
 - Lambda and DynamoDB as a Backend
 - CloudFormation and SAM for Infrastructure management

The application utilizes Ember.js methodology by abstracting API Gateway communication into adapters, allowing you to write controller code utilizing ember models. The API Gateway SDK that is generated from API Gateway can easily be replaced if you update your API by simple replacing the `vendor/apiGateway-js-sdk` with the generated one from API Gateway. Lambda functions can easily be updated by running the included `cloud/deploy.sh` bash script which simply runs the appropriate cloudformation commands for you.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with NPM)
* [Bower](https://bower.io/)
* [AWS CLI](https://aws.amazon.com/cli)
* [Ember CLI](https://ember-cli.com/)

## Installation

* `git clone`
* `cd client`
* `npm install && bower install`

## Creating the AWS Infrastructure

***Please NOTE: the following steps will incur charges on your AWS account, please see the appropriate pricing pages for the services***

Set up AWS infra
   

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying the Web Application

Build the ember app and copy it to S3, note you'll need the "WebsiteBucket" output value from the above hosting cloudformation stack you generated. If you need it again, just run `aws cloudformation describe-stacks --stack-name ember-serverless-hosting` *if you used a different name, substitute that in-place of "ember-serverless-hosting", then note the `OutputValue` for "WebsiteBucket" and use that here:

    cd client
    ember build
    aws s3 sync dist/ s3://<<your-ember-website-bucket>>/ -acl public-read

Once synced you can visit the URL for your S3 bucket using the `OutputValue` from the hosting template for `WebsiteURL`.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* [aws-cli](https://aws.amazon.com/cli)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
# Ember client side app with SSO, API Gateway, Lambda and DynamoDB
# easyquote-aws-serverless
