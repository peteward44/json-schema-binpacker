
function joinPath( ...args ) {
	let result = '';
	for ( const arg of args ) {
		if ( result.length > 0 && result[result.length-1] !== '.' ) {
			result += '.';
		}
		result += arg;
	}
	return result;
}

function traverseSchema( map, parentPath, schema ) {
	console.log( `traversing ${parentPath}` );

	switch ( schema.type ) {
	case 'object':
		if ( schema.properties ) {
			for ( const name in schema.properties ) {
				if ( schema.properties.hasOwnProperty( name ) ) {
					traverseSchema( map, joinPath( parentPath, name ), schema.properties[name] );
				}
			}
		}
		if ( schema.patternProperties ) {
			
		}
		break;
	case 'array':
		if ( schema.items ) {
			traverseSchema( map, parentPath, schema.items );
		}
		break;
	default:
		map.set( parentPath, { id: map.size, type: schema.type } );
	// case 'string':
	// case 'integer':
	// case 'number':
	// case 'boolean':
	// case 'null':
		break;
	}
}

function traverseObject( output, map, parentPath, object ) {
	const entry = map.get( parentPath );
	if ( entry ) {
		// TODO: write out ID according to size
		output.writeUInt8( entry.id, output.pos );
		output.pos += 1;
		switch ( entry.type ) {
		case 'string':
			const len = Buffer.byteLength( object, 'utf8' );
			output.buffer.writeUInt16LE( len, output.pos );
			output.pos += 2;
			output.buffer.write( object, output.pos, 'utf8' );
			output.pos += len;
			break;
		case 'integer':
			output.buffer.writeUInt32LE( object, output.pos );
			output.pos += 4;
			break;
		case 'number':
			output.buffer.writeFloatLE( object, output.pos );
			output.pos += 4;
			break;
		case 'boolean':
			output.buffer.writeUInt8( object ? 1 : 0, output.pos );
			output.pos += 1;
			break;
	}
}

function compress( schema, object ) {
	const buffer = Buffer.alloc( 2048 );
	const map = new Map();
	traverseSchema( map, '', schema );
	console.log( `map ${JSON.stringify(Array.from( map.keys() ))}` );
	traverseObject( { buffer, pos: 0 }, map, '', object );
	return buffer;
}

function decompress( schema, buffer ) {
	
}

exports.compress = compress;
exports.decompress = decompress;

