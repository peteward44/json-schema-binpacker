const limits = require( './limits.js' );

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

function shouldUseFloat( schema ) {
	if ( typeof schema.minimum === 'number' && typeof schema.maximum === 'number' ) {
		return schema.minimum >= limits.FLT_MIN && schema.maximum <= limits.FLT_MAX;
	}
	return false;
}

function getNumberType( schema ) {
	if ( typeof schema.minimum === 'number' && typeof schema.maximum === 'number' ) {
		// TODO: store ranges instead of integers to reduce sizes further
		if ( schema.minimum < 0 ) {
			// signed
			if ( schema.minimum >= -0x7F && schema.maximum <= 0x7F ) {
				return "int8";
			} else if ( schema.minimum >= -0x7FFF && schema.maximum <= 0x7FFF ) {
				return "int16";
			} else {
				return "int32";
			}
		} else {
			// unsigned
			if ( schema.maximum > 0xFFFF ) {
				return "uint32";
			} else if ( schema.maximum > 0xFF ) {
				return "uint16";
			} else {
				return "uint8";
			}
		}
	}
	return "int32";
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
		output.buffer.writeUInt8( entry.id, output.pos );
		output.pos += 1;
		switch ( entry.schema.type ) {
		case 'string':
			const len = Buffer.byteLength( object, 'utf8' );
			output.buffer.writeUInt16LE( len, output.pos );
			output.pos += 2;
			output.buffer.write( object, output.pos, 'utf8' );
			output.pos += len;
			break;
		case 'integer':
			const numberType = getNumberType( entry.schema );
			switch( numberType ) {
				case "uint8":
					output.buffer.writeUInt8( object, output.pos );
					output.pos += 1;
					break;
				case "uint16":
					output.buffer.writeUInt16LE( object, output.pos );
					output.pos += 2;
					break;
				case "uint32":
					output.buffer.writeUInt32LE( object, output.pos );
					output.pos += 4;
					break;
				case "int8":
					output.buffer.writeInt8( object, output.pos );
					output.pos += 1;
					break;
				case "int16":
					output.buffer.writeInt16LE( object, output.pos );
					output.pos += 2;
					break;
				case "int32":
					output.buffer.writeInt32LE( object, output.pos );
					output.pos += 4;
					break;
			}
			break;
		case 'number':
			if ( shouldUseFloat( entry.schema ) ) {
				output.buffer.writeFloatLE( object, output.pos );
				output.pos += 4;
			} else {
				output.buffer.writeDoubleLE( object, output.pos );
				output.pos += 8;
			}
			break;
		case 'boolean':
			output.buffer.writeUInt8( object ? 1 : 0, output.pos );
			output.pos += 1;
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
	const buffer = Buffer.alloc( 32 );
	const output = { buffer, pos: 0 };
	traverseObject( output, map, '', object );
	buffer.writeUInt8( 0, output.pos );
	output.pos += 1;
	return buffer;
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
		const id = input.buffer.readUInt8( input.pos );
		input.pos += 1;
		console.log( `id=${id}` );
		const element = map.get( id );
		if ( !element ) {
			return;
		}
		switch ( element.schema.type ) {
			case 'string':
				const len = input.buffer.readUInt16LE( input.pos );
				input.pos += 2;
				const str = input.buffer.toString( 'utf8', input.pos, input.pos + len );
				input.pos += len;
				insertIntoObject( obj, element.path, str );
				break;
			case 'integer':
				const numberType = getNumberType( element.schema );
				let integer;
				switch( numberType ) {
					case "uint8":
						integer = input.buffer.readUInt8( input.pos );
						input.pos += 1;
						break;
					case "uint16":
						integer = input.buffer.readUInt16LE( input.pos );
						input.pos += 2;
						break;
					case "uint32":
						integer = input.buffer.readUInt32LE( input.pos );
						input.pos += 4;
						break;
					case "int8":
						integer = input.buffer.readInt8( input.pos );
						input.pos += 1;
						break;
					case "int16":
						integer = input.buffer.readInt16LE( input.pos );
						input.pos += 2;
						break;
					case "int32":
						integer = input.buffer.readInt32LE( input.pos );
						input.pos += 4;
						break;
				}
				insertIntoObject( obj, element.path, integer );
				break;
			case 'number':
				let num;
				if ( shouldUseFloat( element.schema ) ) {
					num = input.buffer.readFloatLE( input.pos );
					input.pos += 4;
				} else {
					num = input.buffer.readDoubleLE( input.pos );
					input.pos += 8;
				}
				insertIntoObject( obj, element.path, num );
				break;
			case 'boolean':
				const boo = input.buffer.readUInt8( input.pos );
				input.pos += 1;
				insertIntoObject( obj, element.path, boo > 0 );
				break;
		}
	}
}

function decompress( schema, buffer ) {
	const map = new Map();
	traverseSchema( map, '', schema, true );
	const obj = {};
	buildObject( obj, map, { buffer, pos: 0 } );
	return obj;
}

exports.compress = compress;
exports.decompress = decompress;

