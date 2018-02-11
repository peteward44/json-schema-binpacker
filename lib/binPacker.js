const io = require( './io.js' );
const schemaMap = require( './schemaMap.js' );

function traverseObject( output, allIdMap, object, currentId ) {
	const entry = allIdMap.get( currentId );
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
		case 'array':
			output.writeInteger( object.length, entry.schema.minItems || 0, entry.schema.maxItems );
			if ( entry.children ) {
				const childId = entry.children.get( "0" );
				if ( typeof childId === 'number' ) {
					// write length of array
					for ( let i=0; i<object.length; ++i ) {
						traverseObject( output, allIdMap, object[i], childId );
					}
				} else {
					// warn about unknown property?
				}
			}
			break;
		case 'object':
			const properties = Object.keys( object );
			output.writeInteger( properties.length, entry.schema.minItems || 0, entry.schema.maxItems );
			for ( let i=0; i<properties.length; ++i ) {
				const prop = properties[i];
				const childId = entry.children.get( prop );
				if ( typeof childId === 'number' ) {
					traverseObject( output, allIdMap, object[prop], childId );
				} else {
					// warn about unknown property?
				}
			}
			break;
		}
	}
}

function compress( schema, object ) {
	if ( typeof object !== 'object' ) {
		throw new Error( `Compress method can only accept objects` );
	}
	const allIdMap = schemaMap.build( schema );
	const output = new io.WriteBuffer();
	traverseObject( output, allIdMap, object, 0 );
	output.writeUInt8( 0 );
	return output.buffer;
}


function createType( input, map, elementOut = {} ) {
	const id = input.readUInt8();
	console.log( `id=${id}` );
	const element = map.get( id );
	if ( !element ) {
		return null;
	}
	elementOut.element = element;
	switch ( element.schema.type ) {
		case 'string':
			return input.readString();
		case 'integer':
			return input.readInteger( element.schema.minimum, element.schema.maximum );
		case 'number':
			return input.readNumber( element.schema.minimum, element.schema.maximum );
		case 'boolean':
			return input.readBoolean();
		case 'array':
		{
			const arr = [];
			const count = input.readInteger( element.schema.minItems || 0, element.schema.maxItems );
			for ( let i=0; i<count; ++i ) {
				arr.push( createType( input, map ) );
			}
			return arr;
		}
		case 'object':
		{
			const obj = {};
			const count = input.readInteger( element.schema.minItems || 0, element.schema.maxItems );
			for ( let i=0; i<count; ++i ) {
				const childElementOut = {};
				const type = createType( input, map, childElementOut );
				obj[childElementOut.element.name] = type;
			}
			return obj;
		}
	}
	return null;
}

function decompress( schema, buffer ) {
	const map = schemaMap.build( schema );
	const input = new io.ReadBuffer( buffer );
	return createType( input, map );
}

exports.compress = compress;
exports.decompress = decompress;

