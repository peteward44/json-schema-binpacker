const execute = require( './execute.js' );

execute( 'Arrays', {
	"empty": {
		schema: {
			"type": "object",
			"properties": {
				"test": {
					"type": "array",
					"items": {
						"type": "integer",
						"minimum": 0
					}
				}
			}
		},
		inputs: {
			"empty": {
				test: []
			}
		}
	}
} );

execute( 'Arrays', {
	"empty": {
		schema: {
			"type": "object",
			"properties": {
				"test": {
					"type": "array",
					"items": {
						"type": "array"
					}
				}
			}
		},
		inputs: {
			"empty multi-dimensional": {
				test: [
					[]
				]
			}
		}
	}
} );

execute( 'Arrays', {
	"empty": {
		schema: {
			"type": "object",
			"properties": {
				"test": {
					"type": "array",
					"items": {
						"type": "array"
					}
				}
			}
		},
		inputs: {
			"empty multi-dimensional multiple entries": {
				test: [
					[],
					[],
					[]
				]
			}
		}
	}
} );

execute( 'Arrays', {
	"empty": {
		schema: {
			"type": "object",
			"properties": {
				"test": {
					"type": "array",
					"items": {
						"type": "object"
					}
				}
			}
		},
		inputs: {
			"single empty object": {
				test: [
					{}
				]
			}
		}
	}
} );


execute( 'Arrays', {
	"empty": {
		schema: {
			"type": "object",
			"properties": {
				"test": {
					"type": "array",
					"items": {
						"type": "object"
					}
				}
			}
		},
		inputs: {
			"multiple empty object": {
				test: [
					{},
					{},
					{}
				]
			}
		}
	}
} );

execute( 'Arrays', {
	"empty": {
		schema: {
			"type": "object",
			"properties": {
				"test": {
					"type": "array",
					"items": {
						"type": "array",
						"items": {
							"type": "object"
						}
					}
				}
			}
		},
		inputs: {
			"single empty object in multi-dimensional array": {
				test: [
					[
						{}
					]
				]
			}
		}
	}
} );


execute( 'Arrays', {
	"empty": {
		schema: {
			"type": "object",
			"properties": {
				"test": {
					"type": "array",
					"items": {
						"type": "array",
						"items": {
							"type": "object"
						}
					}
				}
			}
		},
		inputs: {
			"single empty object in multi-dimensional array": {
				test: [
					[
						{}
					],
					[
						{}
					],
					[
						{}
					]
				]
			}
		}
	}
} );


execute( 'Arrays', {
	"empty": {
		schema: {
			"type": "object",
			"properties": {
				"test": {
					"type": "array",
					"items": {
						"type": "object",
						"properties": {
							"array": {
								"type": "array",
								"items": {
									"type": "object",
									"properties": {
										"num": {
											"type": "integer"
										}
									}
								}
							}
						}
					}
				}
			}
		},
		inputs: {
			"array deep in object within another array": {
				test: [
					{
						array: [
							{
								num: 100
							}
						]
					},
					{
						array: [
							{
								num: 50
							}
						]
					}
				]
			}
		}
	}
} );

