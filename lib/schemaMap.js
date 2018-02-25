
const startingID = 3;


function traverseSchema( allIdMap, parentId, schema, propertyName, isPattern = false ) {
	const obj = { id: allIdMap.size + startingID, name: propertyName, parentId, schema, isPattern };
	allIdMap.set( obj.id, obj );
	
	switch ( schema.type ) {
	case 'object':
		if ( schema.properties ) {
			for ( const name in schema.properties ) {
				if ( schema.properties.hasOwnProperty( name ) ) {
					const childId = traverseSchema( allIdMap, obj.id, schema.properties[name], name );
					obj.children = obj.children || new Map();
					obj.children.set( name, childId );
				}
			}
		}
		if ( schema.patternProperties ) {
			for ( const name in schema.patternProperties ) {
				if ( schema.patternProperties.hasOwnProperty( name ) ) {
					const childId = traverseSchema( allIdMap, obj.id, schema.patternProperties[name], name, true );
					obj.children = obj.children || new Map();
					obj.children.set( name, childId );
				}
			}
		}
		break;
	case 'array':
		let array = schema.items;
		if ( typeof schema.items === 'object' && !Array.isArray( schema.items ) ) {
			array = [schema.items];
		}
		if ( Array.isArray( array ) ) {
			for ( let i=0; i<array.length; ++i ) {
				const childId = traverseSchema( allIdMap, obj.id, array[i], i.toString() );
				obj.children = obj.children || new Map();
				obj.children.set( i.toString(), childId );
			}
		}
		break;
	default:
	// case 'string':
	// case 'integer':
	// case 'number':
	// case 'boolean':
	// case 'null':
		break;
	}
	return obj.id;
}

function build( schema ) {
	const allIdMap = new Map();
	traverseSchema( allIdMap, 0, schema, '' );
	return allIdMap;
}

exports.build = build;
exports.startingID = startingID;
exports.unknownArrayItemID = 0;
exports.unknownObjectPropertyID = 1;
exports.objectPatternPropertyID = 2;
