const execute = require( './execute.js' );
const limits = require( '../lib/limits.js' );

const schemas = {
	"boolean": {
		"type": "boolean"
	},
	"float": {
		"type": "number",
		"minimum": limits.FLT_MIN,
		"maximum": limits.FLT_MAX
	},
	"double": {
		"type": "number"
	},
	"uint8": {
		"type": "integer",
		"minimum": 0,
		"maximum": 0xFF
	},
	"uint16": {
		"type": "integer",
		"minimum": 0,
		"maximum": 0xFFFF
	},
	"uint32": {
		"type": "integer",
		"minimum": 0,
		"maximum": 0xFFFFFFFF
	},
	"int8": {
		"type": "integer",
		"minimum": -0x7F,
		"maximum": 0x7F
	},
	"int16": {
		"type": "integer",
		"minimum": -0x7FFF,
		"maximum": 0x7FFF
	},
	"int32": {
		"type": "integer",
		"minimum": -0x7FFFFFFF,
		"maximum": 0x7FFFFFFF
	},
	"string": {
		"type": "string"
	}
};

const tests = {
	"boolean": {
		schema: schemas.boolean,
		inputs: {
			"true": true,
			"false": false
		}
	},
	"float": {
		schema: schemas.float,
		inputs: {
			"0": 0,
			"-100": -100,
			"100": 100,
			"limits.FLT_MIN": limits.FLT_MIN,
			"limits.FLT_MIN": limits.FLT_MAX
		}
	},
	"double": {
		schema: schemas.double,
		inputs: {
			"0": 0,
			"-100": -100,
			"100": 100,
			"-50.123842": -50.123842,
			"98.3234213": 98.3234213,
			"Number.MIN_SAFE_INTEGER": Number.MIN_SAFE_INTEGER,
			"Number.MAX_SAFE_INTEGER": Number.MAX_SAFE_INTEGER,
			"Number.MIN_VALUE": Number.MIN_VALUE,
			"Number.MAX_VALUE": Number.MAX_VALUE
		}
	},
	"uint8": {
		schema: schemas.uint8,
		inputs: {
			"0": 0,
			"100": 100,
			"0xFF": 0xFF
		}
	},
	"uint16": {
		schema: schemas.uint16,
		inputs: {
			"0": 0,
			"100": 100,
			"0xFF": 0xFF,
			"0xFFFF": 0xFFFF
		}
	},
	"uint32": {
		schema: schemas.uint32,
		inputs: {
			"0": 0,
			"100": 100,
			"0xFF": 0xFF,
			"0xFFFF": 0xFFFF,
			"0xFFFFFFFF": 0xFFFFFFFF
		}
	},
	"int8": {
		schema: schemas.int8,
		inputs: {
			"-0x7F": -0x7F,
			"0": 0,
			"100": 100,
			"0x7F": 0x7F
		}
	},
	"int16": {
		schema: schemas.int16,
		inputs: {
			"-0x7FFF": -0x7FFF,
			"0": 0,
			"100": 100,
			"0xFF": 0xFF,
			"0x7FFF": 0x7FFF
		}
	},
	"int32": {
		schema: schemas.int32,
		inputs: {
			"-0x7FFFFFFF": -0x7FFFFFFF,
			"0": 0,
			"100": 100,
			"0xFF": 0xFF,
			"0xFFFF": 0xFFFF,
			"0x7FFFFFFF": 0x7FFFFFFF
		}
	}
};

execute( 'Pure type tests', tests );
