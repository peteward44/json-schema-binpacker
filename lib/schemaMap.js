
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
		let array = schema.items;
		if ( typeof schema.items === 'object' && !Array.isArray( schema.items ) ) {
			array = [schema.items];
		}
		console.log (`array=${JSON.stringify( array) }` );
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
