const io = require( './io.js' );
const schemaMap = require( './schemaMap.js' );

function createType( input, allIdMap, elementOut = null ) {
	const id = input.readInteger( 0, allIdMap.size + schemaMap.startingID );
	const element = allIdMap.get( id );
	if ( !element ) {
		switch ( id ) {
			case schemaMap.objectPatternPropertyID:
			{
				const elementName = input.readString();
				if ( elementOut ) {
					elementOut.name = elementName;
				}
				return createType( input, allIdMap );
			}
			case schemaMap.unknownObjectPropertyID:
			{
				const elementName = input.readString();
				if ( elementOut ) {
					elementOut.name = elementName;
				}
				return input.readUnknown();
			}
			case schemaMap.unknownArrayItemID:
				return input.readUnknown();
		}
	}
	if ( elementOut ) {
		elementOut.name = element.name;
	}
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
				arr.push( createType( input, allIdMap ) );
			}
			return arr;
		}
		case 'object':
		{
			const obj = {};
			const count = input.readInteger( element.schema.minProperties || 0, element.schema.maxProperties );
			for ( let i=0; i<count; ++i ) {
				const childElementOut = {};
				const type = createType( input, allIdMap, childElementOut );
				obj[childElementOut.name] = type;
			}
			return obj;
		}
	}
	return null;
}

/**
 * @param {Object} schema - Input schema
 * @param {Buffer} buffer - Input data buffer containing compressed data
 * @param {compressOptions} [options] - Options
 */
function decompress( schema, buffer, options = {} ) {
	const allIdMap = schemaMap.build( schema );
	const input = new io.ReadBuffer( buffer, options );
	return createType( input, allIdMap );
}

module.exports = decompress;
