const io = require( './io.js' );

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


function traverseSchema( map, parentPath, schema, reverseMap = false ) {
	console.log( `traversing ${parentPath}` );

	switch ( schema.type ) {
	case 'object':
		if ( schema.properties ) {
			for ( const name in schema.properties ) {
				if ( schema.properties.hasOwnProperty( name ) ) {
					traverseSchema( map, joinPath( parentPath, name ), schema.properties[name], reverseMap );
				}
			}
		}
		if ( schema.patternProperties ) {
			
		}
		break;
	case 'array':
		if ( Array.isArray( schema.items ) ) {
			// tuple
		} else if ( typeof schema.items === 'object' ) {
			traverseSchema( map, parentPath, schema.items, reverseMap );
		}
		break;
	default:
	// case 'string':
	// case 'integer':
	// case 'number':
	// case 'boolean':
	// case 'null':
		const obj = { id: map.size + 1, path: parentPath, schema };
		map.set( reverseMap ? obj.id : obj.path, obj );
		break;
	}
}

function traverseObject( output, map, parentPath, object ) {
	console.log( `traverseObject=parentPath= ${parentPath}` );
	const entry = map.get( parentPath );
	if ( entry ) {
		// TODO: write out ID according to size
		output.writeUInt8( entry.id );
		switch ( entry.schema.type ) {
		case 'string':
			output.writeString( object );
			break;
		case 'integer':
			output.writeInteger( object, entry.schema.minimum, entry.schema.maximum );
			break;
		case 'number':
			output.writeNumber( object, entry.schema.minimum, entry.schema.maximum );
			break;
		case 'boolean':
			output.writeBoolean( object );
			break;
		}
	} else {
		if ( Array.isArray( object ) ) {
			
		} else if ( typeof object === 'object' ) {
			for ( const prop in object ) {
				if ( object.hasOwnProperty( prop ) ) {
					traverseObject( output, map, joinPath( parentPath, prop ), object[prop] );
				}
			}
		}
	}
}

function compress( schema, object ) {
	if ( typeof object !== 'object' ) {
		throw new Error( `Compress method can only accept objects` );
	}
	const map = new Map();
	traverseSchema( map, '', schema, false );
	console.log( `map ${JSON.stringify(Array.from( map.keys() ))}` );
	const output = new io.WriteBuffer();
	traverseObject( output, map, '', object );
	output.writeUInt8( 0 );
	return output.buffer;
}

function insertIntoObject( obj, path, val ) {
	const split = path.split( '.' );
	let element = obj;
	for ( let i=0; i<split.length-1; ++i ) {
		if ( !obj.hasOwnProperty( split[i] ) ) {
			obj[split[i]] = {};
		}
		element = obj[split[i]];
	}
	element[split[split.length-1]] = val;
}

function buildObject( obj, map, input ) {
	while ( true ) {
		const id = input.readUInt8();
		console.log( `id=${id}` );
		const element = map.get( id );
		if ( !element ) {
			return;
		}
		switch ( element.schema.type ) {
			case 'string':
				const str = input.readString();
				insertIntoObject( obj, element.path, str );
				break;
			case 'integer':
				const integer = input.readInteger( element.schema.minimum, element.schema.maximum );
				insertIntoObject( obj, element.path, integer );
				break;
			case 'number':
				const num = input.readNumber( element.schema.minimum, element.schema.maximum );
				insertIntoObject( obj, element.path, num );
				break;
			case 'boolean':
				const boo = input.readBoolean();
				insertIntoObject( obj, element.path, boo );
				break;
		}
	}
}

function decompress( schema, buffer ) {
	const map = new Map();
	traverseSchema( map, '', schema, true );
	const obj = {};
	const input = new io.ReadBuffer( buffer );
	buildObject( obj, map, input );
	return obj;
}

exports.compress = compress;
exports.decompress = decompress;

