var Command = require('ronin').Command;

var vendSdk = require('vend-nodejs-sdk')({});
var utils = require('./../utils/utils.js');
var fileSystem = require('q-io/fs');
//var Promise = require('bluebird');
var moment = require('moment');
//var _ = require('underscore');
var path = require('path');

var ListProducts = Command.extend({
  desc: 'List Products (200 at a time)',

  options: {
  },

  run: function () {
    var commandName = path.basename(__filename, '.js');
    var token = this.global.token;
    var domain = this.global.domain;

    var connectionInfo = utils.loadOauthTokens(token, domain);

    var args = vendSdk.args.products.fetch();
    args.orderBy.value = 'id';
    args.page.value = 1;
    args.pageSize.value = 200;
    args.active.value = true;

    return vendSdk.products.fetch(args, connectionInfo)
      .tap(function(response) {
        return utils.updateOauthTokens(connectionInfo);
      })
      .then(function(response) {
        console.log(commandName + ' > response.products.length: ', response.products.length);
        //console.log('response.products: ', JSON.stringify(response.products,vendSdk.replacer,2));

        var filename = 'listProducts-' + moment.utc().format('YYYY-MMM-DD_HH-mm-ss') + '.json';
        console.log('saving to ' + filename);
        return fileSystem.write(filename, // save to current working directory
          JSON.stringify(response.products,vendSdk.replacer,2));
      })
      .catch(function(e) {
        console.error(commandName + ' > An unexpected error occurred: ', e);
      });
  }
});

module.exports = ListProducts;
