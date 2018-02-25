const Buffer = require( 'buffer/' ).Buffer;
const limits = require( './limits.js' );

const startingBufferSize = 128;
const bufferIncreaseLimit = 16384;
const defaultStringEncoding = 'utf8';

function shouldUseFloat( minimum, maximum ) {
	if ( typeof minimum === 'number' && typeof maximum === 'number' ) {
		return minimum >= limits.FLT_MIN && maximum <= limits.FLT_MAX;
	}
	return false;
}

function getNumberType( minimum, maximum ) {
	if ( typeof minimum === 'number' && typeof maximum === 'number' ) {
		// TODO: store ranges instead of integers to reduce sizes further
		if ( minimum < 0 ) {
			// signed
			if ( minimum >= -0x7F && maximum <= 0x7F ) {
				return "int8";
			} else if ( minimum >= -0x7FFF && maximum <= 0x7FFF ) {
				return "int16";
			} else {
				return "int32";
			}
		} else {
			// unsigned
			if ( maximum > 0xFFFF ) {
				return "uint32";
			} else if ( maximum > 0xFF ) {
				return "uint16";
			} else {
				return "uint8";
			}
		}
	}
	return "int32";
}


class WriteBuffer {
	/**
	 * @param {compressOptions} [options] - Options
	 */
	constructor( options = {} ) {
		this._options = options;
		this._options.stringEncoding = this._options.stringEncoding || defaultStringEncoding;
		this._buffer = Buffer.alloc( startingBufferSize );
		this._pos = 0;
		this._strings = [];
	}
	
	get position() {
		return this._pos;
	}
	
	set position( val ) {
		this._pos = val;
	}
	
	writeUInt8( num ) {
		this._checkBuffer( 1 );
		this._buffer.writeUInt8( num, this._pos );
		this._pos += 1;
	}
	
	writeNumber( num, minimum, maximum ) {
		if ( shouldUseFloat( minimum, maximum ) ) {
			this._checkBuffer( 4 );
			if ( !this._options.bigEndian ) {
				this._buffer.writeFloatLE( num, this._pos );
			} else {
				this._buffer.writeFloatBE( num, this._pos );
			}
			this._pos += 4;
		} else {
			this._checkBuffer( 8 );
			if ( !this._options.bigEndian ) {
				this._buffer.writeDoubleLE( num, this._pos );
			} else {
				this._buffer.writeDoubleBE( num, this._pos );
			}
			this._pos += 8;
		}
	}
	
	writeInteger( num, minimum, maximum ) {
		switch( getNumberType( minimum, maximum ) ) {
			case "uint8":
				this._checkBuffer( 1 );
				this._buffer.writeUInt8( num, this._pos );
				this._pos += 1;
				break;
			case "uint16":
				this._checkBuffer( 2 );
				if ( !this._options.bigEndian ) {
					this._buffer.writeUInt16LE( num, this._pos );
				} else {
					this._buffer.writeUInt16BE( num, this._pos );
				}
				this._pos += 2;
				break;
			case "uint32":
				this._checkBuffer( 4 );
				if ( !this._options.bigEndian ) {
					this._buffer.writeUInt32LE( num, this._pos );
				} else {
					this._buffer.writeUInt32BE( num, this._pos );
				}
				this._pos += 4;
				break;
			case "int8":
				this._checkBuffer( 1 );
				this._buffer.writeInt8( num, this._pos );
				this._pos += 1;
				break;
			case "int16":
				this._checkBuffer( 2 );
				if ( !this._options.bigEndian ) {
					this._buffer.writeInt16LE( num, this._pos );
				} else {
					this._buffer.writeInt16BE( num, this._pos );
				}
				this._pos += 2;
				break;
			case "int32":
				this._checkBuffer( 4 );
				if ( !this._options.bigEndian ) {
					this._buffer.writeInt32LE( num, this._pos );
				} else {
					this._buffer.writeInt32BE( num, this._pos );
				}
				this._pos += 4;
				break;
		}
	}
	
	writeString( str ) {
		let index = this._strings.indexOf( str );
		if ( index < 0 ) {
			index = this._strings.length;
			this._strings.push( str );
		}
		if ( !this._options.bigEndian ) {
			this._buffer.writeUInt16LE( index, this._pos );
		} else {
			this._buffer.writeUInt16BE( index, this._pos );
		}
		this._pos += 2;
	}
	
	writeBoolean( boo ) {
		this._checkBuffer( 1 );
		this._buffer.writeUInt8( boo ? 1 : 0, this._pos );
		this._pos += 1;
	}
	
	writeUnknown( unknown ) {
		const jsonStr = JSON.stringify( { "p": unknown } );
		const len = Buffer.byteLength( jsonStr, this._options.stringEncoding );
		this._checkBuffer( len + 4 );
		if ( !this._options.bigEndian ) {
			this._buffer.writeUInt32LE( len, this._pos );
		} else {
			this._buffer.writeUInt32BE( len, this._pos );
		}
		this._pos += 4;
		this._buffer.write( jsonStr, this._pos, this._options.stringEncoding );
		this._pos += len;
	}
	
	toBuffer() {
		// write string dictionary first - work out how big it will be first
		let bufferSize = this._pos + 2;
		for ( const string of this._strings ) {
			bufferSize += Buffer.byteLength( string, this._options.stringEncoding ) + 2;
		}
		const newBuffer = Buffer.alloc( bufferSize );
		// write out number of entries in string dictionary
		let pos = 0;
		if ( !this._options.bigEndian ) {
			newBuffer.writeUInt16LE( this._strings.length, pos );
		} else {
			newBuffer.writeUInt16BE( this._strings.length, pos );
		}
		pos += 2;
		// then write each string, prefixed by it's length
		for ( const string of this._strings ) {
			const len = Buffer.byteLength( string, this._options.stringEncoding );
			if ( !this._options.bigEndian ) {
				newBuffer.writeUInt16LE( len, pos );
			} else {
				newBuffer.writeUInt16BE( len, pos );
			}
			pos += 2;
			newBuffer.write( string, pos, this._options.stringEncoding );
			pos += len;
		}
		this._buffer.copy( newBuffer, pos, 0, this._buffer.length );
		return newBuffer;
	}
	
	_calcNewBufferSize( requiredSize ) {
		let newSize = this._buffer.length;
		do {
			const bufferIncrease = Math.min( newSize, bufferIncreaseLimit );
			newSize = this._buffer.length + bufferIncrease;
		} while ( newSize < requiredSize );
		return newSize;
	}
	
	_checkBuffer( increase ) {
		if ( this._pos + increase >= this._buffer.length ) {
			const newSize = this._calcNewBufferSize( this._pos + increase );
			const newBuffer = Buffer.alloc( newSize );
			this._buffer.copy( newBuffer, 0 );
			// TODO: release old buffer properly?
			this._buffer = newBuffer;
		}
	}
}



class ReadBuffer {
	/**
	 * @param {Buffer} buffer - Input data buffer containing compressed data
	 * @param {compressOptions} [options] - Options
	 */
	constructor( buffer, options = {} ) {
		this._options = options;
		this._options.stringEncoding = this._options.stringEncoding || defaultStringEncoding;
		this._buffer = buffer;
		this._pos = 0;
		this._strings = [];
		let stringCount;
		if ( !this._options.bigEndian ) {
			stringCount = this._buffer.readUInt16LE( this._pos );
		} else {
			stringCount = this._buffer.readUInt16BE( this._pos );
		}
		this._pos += 2;
		for ( let i=0; i<stringCount; ++i ) {
			let len;
			if ( !this._options.bigEndian ) {
				len = this._buffer.readUInt16LE( this._pos );
			} else {
				len = this._buffer.readUInt16BE( this._pos );
			}
			this._pos += 2;
			const str = this._buffer.toString( this._options.stringEncoding, this._pos, this._pos + len );
			this._pos += len;
			this._strings.push( str );
		}
	}
	
	get position() {
		return this._pos;
	}
	
	set position( val ) {
		this._pos = val;
	}
	
	readUInt8() {
		const num = this._buffer.readUInt8( this._pos );
		this._pos += 1;
		return num;
	}
	
	readNumber( minimum, maximum ) {
		const pos = this._pos;
		if ( shouldUseFloat( minimum, maximum ) ) {
			this._pos += 4;
			if ( !this._options.bigEndian ) {
				return this._buffer.readFloatLE( pos );
			} else {
				return this._buffer.readFloatBE( pos );
			}
		} else {
			this._pos += 8;
			if ( !this._options.bigEndian ) {
				return this._buffer.readDoubleLE( pos );
			} else {
				return this._buffer.readDoubleBE( pos );
			}
		}
	}
	
	readInteger( minimum, maximum ) {
		const pos = this._pos;
		switch( getNumberType( minimum, maximum ) ) {
			case "uint8":
				this._pos += 1;
				return this._buffer.readUInt8( pos );
				break;
			case "uint16":
				this._pos += 2;
				if ( !this._options.bigEndian ) {
					return this._buffer.readUInt16LE( pos );
				} else {
					return this._buffer.readUInt16BE( pos );
				}
				break;
			case "uint32":
				this._pos += 4;
				if ( !this._options.bigEndian ) {
					return this._buffer.readUInt32LE( pos );
				} else {
					return this._buffer.readUInt32BE( pos );
				}
				break;
			case "int8":
				this._pos += 1;
				return this._buffer.readInt8( pos );
				break;
			case "int16":
				this._pos += 2;
				if ( !this._options.bigEndian ) {
					return this._buffer.readInt16LE( pos );
				} else {
					return this._buffer.readInt16BE( pos );
				}
				break;
			case "int32":
				this._pos += 4;
				if ( !this._options.bigEndian ) {
					return this._buffer.readInt32LE( pos );
				} else {
					return this._buffer.readInt32BE( pos );
				}
				break;
		}
		return 0;
	}
	
	readString() {
		let id;
		if ( !this._options.bigEndian ) {
			id = this._buffer.readUInt16LE( this._pos );
		} else {
			id = this._buffer.readUInt16BE( this._pos );
		}
		this._pos += 2;
		return this._strings[id];
	}
	
	readBoolean() {
		const b = this._buffer.readUInt8( this._pos ) > 0;
		this._pos += 1;
		return b;
	}
	
	readUnknown() {
		let len;
		if ( !this._options.bigEndian ) {
			len = this._buffer.readUInt32LE( this._pos );
		} else {
			len = this._buffer.readUInt32BE( this._pos );
		}
		this._pos += 4;
		const str = this._buffer.toString( this._options.stringEncoding, this._pos, this._pos + len );
		this._pos += len;
		return JSON.parse( str ).p;
	}
}

exports.WriteBuffer = WriteBuffer;
exports.ReadBuffer = ReadBuffer;
