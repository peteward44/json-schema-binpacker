const { assert } = require( 'chai' );
const binPacker = require( '..' );
const limits = require( '../limits.js' );

const schemas = {
	"boolean": {
		"type": "object",
		"properties": {
			"test": {
				"type": "boolean"
			}
		}
	},
	"float": {
		"type": "object",
		"properties": {
			"test": {
				"type": "number",
				"minimum": limits.FLT_MIN,
				"maximum": limits.FLT_MAX
			}
		}
	},
	"double": {
		"type": "object",
		"properties": {
			"test": {
				"type": "number"
			}
		}
	},
	"uint8": {
		"type": "object",
		"properties": {
			"test": {
				"type": "integer",
				"minimum": 0,
				"maximum": 0xFF
			}
		}
	},
	"uint16": {
		"type": "object",
		"properties": {
			"test": {
				"type": "integer",
				"minimum": 0,
				"maximum": 0xFFFF
			}
		}
	},
	"uint32": {
		"type": "object",
		"properties": {
			"test": {
				"type": "integer",
				"minimum": 0,
				"maximum": 0xFFFFFFFF
			}
		}
	},
	"int8": {
		"type": "object",
		"properties": {
			"test": {
				"type": "integer",
				"minimum": -0x7F,
				"maximum": 0x7F
			}
		}
	},
	"int16": {
		"type": "object",
		"properties": {
			"test": {
				"type": "integer",
				"minimum": -0x7FFF,
				"maximum": 0x7FFF
			}
		}
	},
	"int32": {
		"type": "object",
		"properties": {
			"test": {
				"type": "integer",
				"minimum": -0x7FFFFFFF,
				"maximum": 0x7FFFFFFF
			}
		}
	},
	"string": {
		"type": "object",
		"properties": {
			"test": {
				"type": "string"
			}
		}
	}
};

const tests = {
	"boolean": {
		schema: schemas.boolean,
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
		schema: schemas.float,
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
		schema: schemas.double,
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
		schema: schemas.uint8,
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
		schema: schemas.uint16,
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
		schema: schemas.uint32,
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
		schema: schemas.int8,
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
		schema: schemas.int16,
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
		schema: schemas.int32,
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
	}
};

describe( 'Type tests', () => {
	for ( const name in tests ) {
		const test = tests[name];
		describe( name, () => {
			for ( const inputName in test.inputs ) {
				const input = test.inputs[inputName];
				it( inputName, () => {
					const buffer = binPacker.compress( test.schema, input );
					assert( buffer, `Buffer object created` );
					assert( buffer.length > 0, `Buffer object has length greater than zero` );
					let str = '';
					for ( let i=0; i<buffer.length; ++i ) {
						str += buffer[i].toString() + ' ';
					}
					console.log( `buffer=${str}` );
					const newObj = binPacker.decompress( test.schema, buffer );
					console.log( `newObj=${JSON.stringify( newObj )}` );
					assert.deepEqual( input, newObj, `Decompressed object matches input object` );
				} );
			}
		} );
	}
	
	// it.skip( 'compress and decompress with different schema will fail', () => {
		
	// } );
} );
