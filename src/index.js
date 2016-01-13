'use strict';

/**
 * Serverless CloudFormation Validation Plugin
 */

module.exports = function(SPlugin, serverlessPath) {
  const AWS       = require('aws-sdk'),
        BbPromise = require('bluebird'),
        fs        = require('fs'),
        path      = require('path'),
        SCli      = require(path.join(serverlessPath, 'utils/cli')),
        SError    = require(path.join(serverlessPath, 'ServerlessError'));

  class ResourcesValidate extends SPlugin {

    /**
     * Define plugin name
     */

    static getName() {
      return 'com.tmilewski.' + ResourcesValidate.name;
    }

    /**
     * Register actions with Serverless
     */

    registerActions() {
      this.S.addAction(this.resourcesValidate.bind(this), {
        handler:       'resourcesValidate',
        description:   `Validates resources-cf.json for 
usage: serverless resources validate`,
        context:       'resources',
        contextAction: 'validate',
        options:       [
          {
            option:      'stage',
            shortcut:    's',
            description: 'Optional if only one stage is defined in project'
          }, {
            option:      'region',
            shortcut:    'r',
            description: 'Optional - Target one region to deploy to'
          }
        ]
      });

      return BbPromise.resolve();
    }

    /**
     * Run through validation process
     */

    resourcesValidate(event) {
      let _this = this,
          evt   = {};

      // If CLI - parse options
      if (_this.S.cli) {

        // Options
        evt = JSON.parse(JSON.stringify(this.S.cli.options)); // Important: Clone objects, don't refer to them
      }

      // If NO-CLI, add options
      if (event) evt = event;

      // Add defaults
      evt.stage = evt.stage ? evt.stage : null;

      _this.evt = evt;

      return BbPromise.try(function() {
        if (_this.S._interactive) {
          SCli.asciiGreeting();
        }
      })
      .bind(_this)
      .then(function() {
        return _this.cliPromptSelectStage('Choose a Stage: ', _this.evt.stage, false)
            .then(stage => {
              _this.evt.stage = stage;
            })
      })
      .then(function() {
        return _this.cliPromptSelectRegion('Choose a Region in this Stage: ', false, true, _this.evt.region, _this.evt.stage)
            .then(region => {
              _this.evt.region = region;
            })
      })
      .then(_this._validate)
      .then(function() {
        SCli.log('Resource Validator: Successful for ' + _this.evt.stage + ' on ' + _this.evt.region);
        return _this.evt;
      });
    }

    /**
     * Validate resources-cf.json
     */

    _validate() {
      let _this = this;

      return new BbPromise(function(resolve, reject) {
        let cloudformation = new AWS.CloudFormation({ region: _this.evt.region });
        let buf = new Buffer(fs.readFileSync('./../cloudformation/resources-cf.json'));

        let params = {
          TemplateBody: buf.toString()
        }

        cloudformation.validateTemplate(params, function (err, data) {
          if (err) {
            throw new SError(err, SError.errorCodes.INVALID_PROJECT_SERVERLESS);
          }

          return resolve();
        });
      });
    }
  }

  return ResourcesValidate;
}


