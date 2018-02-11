const limits = require( './limits.js' );

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
	constructor() {
		this._bigEndian = false;
		this._buffer = Buffer.alloc( 1024 );
		this._pos = 0;
	}
	
	get buffer() {
		return this._buffer;
	}
	
	get position() {
		return this._pos;
	}
	
	set position( val ) {
		this._pos = val;
	}
	
	writeUInt8( num ) {
		this._buffer.writeUInt8( num, this._pos );
		this._pos += 1;
	}
	
	writeNumber( num, minimum, maximum ) {
		if ( shouldUseFloat( minimum, maximum ) ) {
			if ( !this._bigEndian ) {
				this._buffer.writeFloatLE( num, this._pos );
			} else {
				this._buffer.writeFloatBE( num, this._pos );
			}
			this._pos += 4;
		} else {
			if ( !this._bigEndian ) {
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
				this._buffer.writeUInt8( num, this._pos );
				this._pos += 1;
				break;
			case "uint16":
				if ( !this._bigEndian ) {
					this._buffer.writeUInt16LE( num, this._pos );
				} else {
					this._buffer.writeUInt16BE( num, this._pos );
				}
				this._pos += 2;
				break;
			case "uint32":
				if ( !this._bigEndian ) {
					this._buffer.writeUInt32LE( num, this._pos );
				} else {
					this._buffer.writeUInt32BE( num, this._pos );
				}
				this._pos += 4;
				break;
			case "int8":
				this._buffer.writeInt8( num, this._pos );
				this._pos += 1;
				break;
			case "int16":
				if ( !this._bigEndian ) {
					this._buffer.writeInt16LE( num, this._pos );
				} else {
					this._buffer.writeInt16BE( num, this._pos );
				}
				this._pos += 2;
				break;
			case "int32":
				if ( !this._bigEndian ) {
					this._buffer.writeInt32LE( num, this._pos );
				} else {
					this._buffer.writeInt32BE( num, this._pos );
				}
				this._pos += 4;
				break;
		}
	}
	
	writeString( str ) {
		const len = Buffer.byteLength( str, 'utf8' );
		if ( !this._bigEndian ) {
			this._buffer.writeUInt16LE( len, this._pos );
		} else {
			this._buffer.writeUInt16BE( len, this._pos );
		}
		this._pos += 2;
		this._buffer.write( str, this._pos, 'utf8' );
		this._pos += len;
	}
	
	writeBoolean( boo ) {
		this._buffer.writeUInt8( boo ? 1 : 0, this._pos );
		this._pos += 1;
	}
}



class ReadBuffer {
	constructor( buffer ) {
		this._bigEndian = false;
		this._buffer = buffer;
		this._pos = 0;
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
			if ( !this._bigEndian ) {
				return this._buffer.readFloatLE( pos );
			} else {
				return this._buffer.readFloatBE( pos );
			}
		} else {
			this._pos += 8;
			if ( !this._bigEndian ) {
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
				if ( !this._bigEndian ) {
					return this._buffer.readUInt16LE( pos );
				} else {
					return this._buffer.readUInt16BE( pos );
				}
				break;
			case "uint32":
				this._pos += 4;
				if ( !this._bigEndian ) {
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
				if ( !this._bigEndian ) {
					return this._buffer.readInt16LE( pos );
				} else {
					return this._buffer.readInt16BE( pos );
				}
				break;
			case "int32":
				this._pos += 4;
				if ( !this._bigEndian ) {
					return this._buffer.readInt32LE( pos );
				} else {
					return this._buffer.readInt32BE( pos );
				}
				break;
		}
		return 0;
	}
	
	readString() {
		let len;
		if ( !this._bigEndian ) {
			len = this._buffer.readUInt16LE( this._pos );
		} else {
			len = this._buffer.readUInt16BE( this._pos );
		}
		this._pos += 2;
		const str = this._buffer.toString( 'utf8', this._pos, this._pos + len );
		this._pos += len;
		return str;
	}
	
	readBoolean() {
		const b = this._buffer.readUInt8( this._pos ) > 0;
		this._pos += 1;
		return b;
	}
}

exports.WriteBuffer = WriteBuffer;
exports.ReadBuffer = ReadBuffer;
