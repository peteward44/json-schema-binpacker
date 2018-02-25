const io = require( './io.js' );
const schemaMap = require( './schemaMap.js' );

/**
 * @typedef {Object} compressOptions
 * @property {boolean} [strict=false] - Enable strict mode - only allow object properties that have been defined in the schema (best compression as unknown elements do
 *    not need to be stored)
 * @property {string} [stringEncoding='utf8'] - String encoding to use when serialising strings & JSON
 * @property {boolean} [bigEndian=false] - True to store numbers in big endian byte order
 */

function checkIsPattern( allIdMap, childrenMap, name ) {
	if ( childrenMap ) {
		for ( const [pattern, elementId] of childrenMap ) {
			const element = allIdMap.get( elementId );
			if ( element.isPattern ) {
				const regex = new RegExp( pattern );
				if ( name.match( regex ) ) {
					return elementId;
				}
			}
		}
	}
	return null;
}

function traverseObject( output, allIdMap, object, currentId, options ) {
	const entry = allIdMap.get( currentId );
	if ( entry ) {
		// write out variable width integer depending on how many elements were found in schema tree.
		// So if there were less than 256 - startingID elements, it would be an 8bit value
		output.writeInteger( entry.id, 0, allIdMap.size + schemaMap.startingID );
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
			// write length of array
			output.writeInteger( object.length, entry.schema.minItems || 0, entry.schema.maxItems );
			const keys = Array.from( entry.children ? entry.children.keys() : [] ).map( str => parseInt( str, 10 ) ).sort();
			for ( let i=0; i<object.length; ++i ) {
				const childId = entry.children ? entry.children.get( ( i % keys.length ).toString() ) : null;
				if ( typeof childId === 'number' ) {
					traverseObject( output, allIdMap, object[i], childId, options );
				} else {
					if ( options.strict ) {
						throw new Error( `Strict mode does not allow unknown elements in JSON!` );
					}
					// type not found in schema - write as json
					// write out element ID as zero, indicates unknown property in an array
					output.writeInteger( schemaMap.unknownArrayItemID, 0, allIdMap.size + schemaMap.startingID );
					output.writeUnknown( object[i] );
				}
			}
			break;
		case 'object':
			const properties = Object.keys( object );
			output.writeInteger( properties.length, entry.schema.minProperties || 0, entry.schema.maxProperties );
			for ( let i=0; i<properties.length; ++i ) {
				const prop = properties[i];
				let childId = entry.children ? entry.children.get( prop ) : null;
				if ( typeof childId === 'number' ) {
					traverseObject( output, allIdMap, object[prop], childId, options );
				} else {
					childId = checkIsPattern( allIdMap, entry.children, prop );
					if ( typeof childId === 'number' ) {
						// for pattern properties, write out the name of the property as a string then traverse object as normal
						output.writeInteger( schemaMap.objectPatternPropertyID, 0, allIdMap.size + schemaMap.startingID );
						output.writeString( prop );
						traverseObject( output, allIdMap, object[prop], childId, options );
					} else {
						if ( options.strict ) {
							throw new Error( `Strict mode does not allow unknown elements in JSON! [property name=${prop}]` );
						}
						// type not found in schema - write as json
						// write out element ID as one, indicates unknown property of an object. Name of property occurs after ID then raw JSON
						output.writeInteger( schemaMap.unknownObjectPropertyID, 0, allIdMap.size + schemaMap.startingID );
						output.writeString( prop );
						output.writeUnknown( object[prop] );
					}
				}
			}
			break;
		}
	} else {
		throw new Error( `Unexpected type error! Is your input data corrupted?` );
	}
}

/**
 * @param {Object} schema - Input schema
 * @param {Object} object - Input object / data type
 * @param {compressOptions} [options] - Options
 */
function compress( schema, object, options = {} ) {
	const allIdMap = schemaMap.build( schema );
	const output = new io.WriteBuffer( options );
	traverseObject( output, allIdMap, object, schemaMap.startingID, options );
	return output.toBuffer();
}

module.exports = compress;
