const { assert } = require( 'chai' );
const binPacker = require( '..' );

describe( 'basic', () => {
	it( 'compress', () => {
		const schema = {
			"title": "Test Schema",
			"type": "object",
			"properties": {
				"reels": {
					"type": "object",
					"properties": {
						"win": {
							"type": "integer",
							"minimum": 0
						},
						"set": {
							"type": "string"
						}
					}
				}
			}
		};
		
		const object = {
			
		};
		
		const buffer = binPacker.compress( schema, object );
		assert( buffer, `Buffer object created` );
		assert( buffer.length > 0, `Buffer object has length greater than zero` );
	} );
	
	it.skip( 'decompress', () => {
		
	} );
	
	it.skip( 'compress and decompress', () => {
		
	} );
	
	it.skip( 'compress and decompress with different schema will fail', () => {
		
	} );
} );
