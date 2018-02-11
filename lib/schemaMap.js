
function traverseSchema( allIdMap, parentId, schema, propertyName ) {
	const obj = { id: allIdMap.size, name: propertyName, parentId, schema };
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
			
		}
		break;
	case 'array':
		if ( Array.isArray( schema.items ) ) {
			// tuple
		} else if ( typeof schema.items === 'object' ) {
			const childId = traverseSchema( allIdMap, obj.id, schema.items, "0" );
			obj.children = obj.children || new Map();
			obj.children.set( "0", childId );
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
	traverseSchema( allIdMap, -1, schema, '' );
	return allIdMap;
}

exports.build = build;