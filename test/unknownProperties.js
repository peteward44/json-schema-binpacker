const execute = require( './execute.js' );
const limits = require( '../lib/limits.js' );

const schemas = {
	"unknown": {
		"type": "object"
	},
	"unknownArray": {
		"type": "array"
	}
};

const tests = {
	"boolean": {
		schema: schemas.unknown,
		inputs: {
			"true": {
				test: true
			},
			"false": {
				test: false
			}
		}
	},
	"float": {
		schema: schemas.unknown,
		inputs: {
			"0": {
				test: 0
			},
			"-100": {
				test: -100
			},
			"100": {
				test: 100
			},
			"limits.FLT_MIN": {
				test: limits.FLT_MIN
			},
			"limits.FLT_MIN": {
				test: limits.FLT_MAX
			}
		}
	},
	"double": {
		schema: schemas.unknown,
		inputs: {
			"0": {
				test: 0
			},
			"-100": {
				test: -100
			},
			"100": {
				test: 100
			},
			"-50.123842": {
				test: -50.123842
			},
			"98.3234213": {
				test: 98.3234213
			},
			"Number.MIN_SAFE_INTEGER": {
				test: Number.MIN_SAFE_INTEGER
			},
			"Number.MAX_SAFE_INTEGER": {
				test: Number.MAX_SAFE_INTEGER
			},
			"Number.MIN_VALUE": {
				test: Number.MIN_VALUE
			},
			"Number.MAX_VALUE": {
				test: Number.MAX_VALUE
			}
		}
	},
	"uint8": {
		schema: schemas.unknown,
		inputs: {
			"0": {
				test: 0
			},
			"100": {
				test: 100
			},
			"0xFF": {
				test: 0xFF
			}
		}
	},
	"uint16": {
		schema: schemas.unknown,
		inputs: {
			"0": {
				test: 0
			},
			"100": {
				test: 100
			},
			"0xFF": {
				test: 0xFF
			},
			"0xFFFF": {
				test: 0xFFFF
			}
		}
	},
	"uint32": {
		schema: schemas.unknown,
		inputs: {
			"0": {
				test: 0
			},
			"100": {
				test: 100
			},
			"0xFF": {
				test: 0xFF
			},
			"0xFFFF": {
				test: 0xFFFF
			},
			"0xFFFFFFFF": {
				test: 0xFFFFFFFF
			}
		}
	},
	"int8": {
		schema: schemas.unknown,
		inputs: {
			"-0x7F": {
				test: -0x7F
			},
			"0": {
				test: 0
			},
			"100": {
				test: 100
			},
			"0x7F": {
				test: 0x7F
			}
		}
	},
	"int16": {
		schema: schemas.unknown,
		inputs: {
			"-0x7FFF": {
				test: -0x7FFF
			},
			"0": {
				test: 0
			},
			"100": {
				test: 100
			},
			"0xFF": {
				test: 0xFF
			},
			"0x7FFF": {
				test: 0x7FFF
			}
		}
	},
	"int32": {
		schema: schemas.unknown,
		inputs: {
			"-0x7FFFFFFF": {
				test: -0x7FFFFFFF
			},
			"0": {
				test: 0
			},
			"100": {
				test: 100
			},
			"0xFF": {
				test: 0xFF
			},
			"0xFFFF": {
				test: 0xFFFF
			},
			"0x7FFFFFFF": {
				test: 0x7FFFFFFF
			}
		}
	},
	"array": {
		schema: schemas.unknown,
		inputs: {
			"empty": {
				test: []
			},
			"1 item object": {
				test: [
					{
						"object": "item"
					}
				]
			},
			"1 item string": {
				test: [
					"item"
				]
			}
		}
	},
	"object": {
		schema: schemas.unknown,
		inputs: {
			"empty": {
				test: {}
			},
			"1 item object": {
				test: {
					"object": "item"
				}
			},
			"1 item string": {
				test: "item"
			}
		}
	},
	"array item": {
		schema: schemas.unknownArray,
		inputs: {
			"empty": [
				{}
			],
			"1 item object": [
				{
					"object": "item"
				}
			],
			"1 item string": [
				"item"
			]
		}
	}
};

execute( 'Unknown property type tests', tests );
