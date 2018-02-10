const { assert } = require( 'chai' );
const binPacker = require( '..' );

function execute( itName, sectionName, tests ) {
	describe( sectionName, () => {
		for ( const name in tests ) {
			const test = tests[name];
			describe( name, () => {
				for ( const inputName in test.inputs ) {
					const input = test.inputs[inputName];
					( itName ? it[itName] : it )( inputName, () => {
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
	} );
}

const method = execute.bind( this, '' );
method.only = execute.bind( this, 'only' );
method.skip = execute.bind( this, 'skip' );
module.exports = method;
