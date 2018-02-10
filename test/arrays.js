const execute = require( './execute.js' );
const limits = require( '../lib/limits.js' );

const schema = {
	"type": "object",
	"properties": {
		"test": {
			"type": "array",
			"items": {
				"type": "integer",
				"minimum": 0
			}
		}
	}
};

const tests = {
	"empty": {
		schema,
		inputs: {
			"empty": {
				test: []
			}
		}
	}
};

execute.only( 'Array tests', tests );
