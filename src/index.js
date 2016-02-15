'use strict';

/**
 * Action: ResourcesValidate
 * - Validates the appropriate CloudFormation template via AWS
 */

module.exports = function(SPlugin, serverlessPath) {

  const AWS    = require('aws-sdk'),
    BbPromise  = require('bluebird'),
    path       = require('path'),
    SCli       = require(path.join(serverlessPath, 'utils/cli')),
    SError     = require(path.join(serverlessPath, 'ServerlessError'));

  class ResourcesValidate extends SPlugin {

    /**
     * Define your plugin's name
     */

    static getName() {
      return 'serverless.tmilewski.' + ResourcesValidate.name;
    }

    /**
     * @returns {Promise} upon completion of all registrations
     */

    registerActions() {
      this.S.addAction(this.resourcesValidate.bind(this), {
        handler:       'resourcesValidate',
        description:   `Validate AWS CloudFormation resources.
usage: serverless resources validate`,
        context:       'resources',
        contextAction: 'validate',
        options:       [
          {
            option:      'region',
            shortcut:    'r',
            description: 'region you want to deploy to'
          },
          {
            option:      'stage',
            shortcut:    's',
            description: 'stage you want to deploy to'
          }
        ]
      });

      return BbPromise.resolve();
    }

    /**
     * Action
     */

    resourcesValidate(evt) {
      let _this    = this;
      _this.evt    = evt;

      return _this._prompt()
        .bind(_this)
        .then(_this._validateAndPrepare)
        .then(_this._validateResources)
        .then(function() {

          /**
           * Return EVT
           */

          return _this.evt;
        });
    }
    
    /**
     * Prompt
     */

    _prompt() {
      let _this = this;

      // Skip if non-interactive or stage is provided
      if (!_this.S.config.interactive || (_this.evt.options.stage && _this.evt.options.region)) return BbPromise.resolve();

      return _this.cliPromptSelectStage('Which stage are you deploying to: ', _this.evt.options.stage, false)
        .then(stage => {
          _this.evt.options.stage = stage;
          BbPromise.resolve();
        })
        .then(function(){
          return _this.cliPromptSelectRegion('Which region are you deploying to: ', false, true, _this.evt.options.region, _this.evt.options.stage)
            .then(region => {
              _this.evt.options.region = region;
              BbPromise.resolve();
            });
        });
    }

    /**
     * Validate & Prepare
     */

    _validateAndPrepare() {

      let _this = this;

      // Non interactive validation
      if (!_this.S.config.interactive) {

        // Check API Keys
        if (!_this.S._awsProfile) {
          if (!_this.S.config.awsAdminKeyId || !_this.S.config.awsAdminSecretKey) {
            return BbPromise.reject(new SError('Missing AWS Profile and/or API Key and/or AWS Secret Key'));
          }
        }

        // Check Params
        if (!_this.evt.options.stage || !_this.evt.options.region) {
          return BbPromise.reject(new SError('Missing stage and/or region and/or key'));
        }
      }

      // Validate stage: make sure stage exists
      if (!_this.S.state.validateStageExists(_this.evt.options.stage) && _this.evt.options.stage != 'local') {
        return BbPromise.reject(new SError('Stage ' + _this.evt.options.stage + ' does not exist in your project'));
      }

      // Validate region: make sure region exists in stage
      if (!_this.S.state.validateRegionExists(_this.evt.options.stage, _this.evt.options.region)) {
        return BbPromise.reject(new SError('Region "' + _this.evt.options.region + '" does not exist in stage "' + _this.evt.options.stage + '"'));
      }
    }

    /**
     * Validate CloudFormation Resources
     */

    _validateResources() {
      let _this = this;

      return _this.S.state.getResources({
        populate: true,
        stage:    _this.evt.options.stage,
        region:   _this.evt.options.region
      })
      .then(function(resources) {
        return BbPromise.try(function() {
          SCli.log('Validating resources to stage "'
            + _this.evt.options.stage
            + '" and region "'
            + _this.evt.options.region
            + '" via Cloudformation.');

          // Start spinner
          _this._spinner = SCli.spinner();
          _this._spinner.start();

          return new BbPromise(function(resolve, reject) {
            let cloudformation = new AWS.CloudFormation({ region: _this.evt.options.region });
            let params = {
              TemplateBody: JSON.stringify(resources)
            };

            cloudformation.validateTemplate(params, function (err, data) {
               _this._spinner.stop(true);

              if (err) {
                throw new SError(err, SError.errorCodes.INVALID_PROJECT_SERVERLESS);
              }

              SCli.log('Resource Validator: Successful on "' + _this.evt.options.stage + '" in "' + _this.evt.options.region + '"');
              return resolve();
            })
          })
        })
      })

      return resolve()
    }
  }

  return( ResourcesValidate );
};
