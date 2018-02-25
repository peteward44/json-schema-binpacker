const execute = require( './execute.js' );
const limits = require( '../lib/limits.js' );

const schemas = {
	"basic": {
		"type": "object",
		"patternProperties": {
			"\\d+": {
				"type": "integer"
			}
		}
	}
};

const tests = {
	"pattern": {
		schema: schemas.basic,
		inputs: {
			"0": {
				"10": 100
			}
		}
	}
};

execute( 'Pattern property tests', tests, { strict: true } );
