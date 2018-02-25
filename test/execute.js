const { assert } = require( 'chai' );
const binPacker = require( '..' );

// Not a test, but the execute method that is used by the tests.
// Simply takes an object containing many data objects and a schema and compresses / decompresses each one
// in turn and makes sure it's the same object that came back out

function execute( itName, sectionName, tests, options ) {
	describe( sectionName, () => {
		for ( const name in tests ) {
			const test = tests[name];
			describe( name, () => {
				for ( const inputName in test.inputs ) {
					const input = test.inputs[inputName];
					( itName ? it[itName] : it )( inputName, () => {
						const buffer = binPacker.compress( test.schema, input, options );
						assert( buffer, `Buffer object created` );
						assert( buffer.length > 0, `Buffer object has length greater than zero` );
						let str = '';
						for ( let i=0; i<buffer.length; ++i ) {
							str += buffer[i].toString() + ' ';
						}
						console.log( `buffer=${str}` );
						const newObj = binPacker.decompress( test.schema, buffer, options );
						console.log( `newObj=${JSON.stringify( newObj )}` );
						console.log( `compressed len=${buffer.length} uncompressed=${JSON.stringify(input).length}` );
						assert.deepEqual( input, newObj, `Decompressed object matches input object` );
					} );
				}
			} );
		}
	} );
}

const method = execute.bind( this, '' );
method.only = execute.bind( this, 'only' );
method.skip = execute.bind( this, 'skip' );
module.exports = method;
