# Serverless CloudFormation Template Validation Plugin

A Serverless Plugin for the [Serverless Framework](http://www.serverless.com) which adds an action to validate your CloudFormation template.

[![npm version](https://badge.fury.io/js/serverless-resources-validation-plugin.svg)](https://badge.fury.io/js/serverless-resources-validation-plugin)
[![Dependency Status](https://david-dm.org/tmilewski/serverless-resources-validation-plugin.svg)](https://david-dm.org/tmilewski/serverless-resources-validation-plugin)
[![DevDependencies Status](https://david-dm.org/joostfarla/serverless-cors-plugin/dev-status.svg)](https://david-dm.org/tmilewski/serverless-resources-validation-plugin#info=devDependencies)

## Introduction

This plugins does the following:

* Validates your CloudFormation template directly against Amazon's parameters.

## Installation

* Go to the root of your Serverless Project
* Run `npm install serverless-resources-validation-plugin --save`
* In your Project's `s-project.json`, in the `plugins` property, add the npm name of your recently added plugin to the array, like this:
```
plugins: [ 
   'serverless-resources-validation-plugin'
]
```

## Usage

`serverless resources validate`

## CLI Options

* `-s --stage`
* `-r --region`

## Roadmap

* Add tests

## License

ISC License. See the [LICENSE](LICENSE) file.
