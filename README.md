# Serverless CloudFormation Template Validation Plugin

A Serverless Plugin for the [Serverless Framework](http://www.serverless.com) which adds an action to validate your CloudFormation template.

[![npm version](https://badge.fury.io/js/serverless-resources-validation-plugin.svg)](https://badge.fury.io/js/serverless-resources-validation-plugin)
[![Dependency Status](https://david-dm.org/tmilewski/serverless-resources-validation-plugin.svg)](https://david-dm.org/tmilewski/serverless-resources-validation-plugin)
[![DevDependencies Status](https://david-dm.org/joostfarla/serverless-cors-plugin/dev-status.svg)](https://david-dm.org/tmilewski/serverless-resources-validation-plugin#info=devDependencies)

## Introduction

This plugins does the following:

* Validates your CloudFormation template (resources-cf.json) directly against Amazon's parameters.

## Installation

Make sure you have a `package.json` file in your `plugins` dir. If it's not there, run `npm init` to generate one.

From your `plugins` dir, run:

```bash
npm install --save serverless-resources-validation-plugin
```

Add the plugin to `s-project.json`:

```json
"plugins": [
  {
    "path": "serverless-resources-validation-plugin"
  }
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
