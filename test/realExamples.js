const execute = require( './execute.js' );
const limits = require( '../lib/limits.js' );


const json = {"reels":{"win":5400,"set":"reel_set_2","positions":[1,29,0,15,26],"landing":[["LO","LO","LO","AC"],["M2","AC","AC","LO"],["LO","LO","LO","LO"],["KI","KI","LO","LO"],["KI","KI","LO","LO"]],"final":[["LO","LO","LO","AC"],["M2","AC","AC","LO"],["LO","LO","LO","LO"],["KI","KI","LO","LO"],["KI","KI","LO","LO"]],"winlines":{"win":5400,"items":[{"win":5000,"symbol":"LO","run":5,"winline":9},{"win":400,"symbol":"LO","run":3,"winline":13}]}},"bonus":{"reelModifierWin":{"type":"HighPayingSymbol","isBonusAwarded":false,"symbols":[{"reel":0,"row":0,"symbol":"LO"},{"reel":0,"row":1,"symbol":"LO"},{"reel":0,"row":2,"symbol":"LO"},{"reel":1,"row":3,"symbol":"LO"},{"reel":2,"row":0,"symbol":"LO"},{"reel":2,"row":1,"symbol":"LO"},{"reel":2,"row":2,"symbol":"LO"},{"reel":2,"row":3,"symbol":"LO"},{"reel":3,"row":2,"symbol":"LO"},{"reel":3,"row":3,"symbol":"LO"},{"reel":4,"row":2,"symbol":"LO"},{"reel":4,"row":3,"symbol":"LO"}]}},"win":5400,"checkpointType":"spin","nextPhase":["end"],"cappedWin":5400};

const schema = {
	"title": "2 Fat Cats Bet Result Standard Schema",
	"type": "object",
	"properties": {
		"reels": {
			"type": "object",
			"properties": {
				"win": {
					"type": "integer",
					"minimum": 0
				},
				"set": {
					"type": "string"
				},
				"positions": {
					"type": "array",
					"items": {
						"type": "integer",
						"minimum": 0
					},
					"minItems": 5,
					"maxItems": 5
				},
				"landing": {
					"type": "array",
					"items": {
						"type": "array",
						"items": {
							"type": "string"
						},
						"minItems": 4, // reel aperture
						"maxItems": 4
					},
					"minItems": 5, // reel count
					"maxItems": 5
				},
				"final": {
					"type": "array",
					"items": {
						"type": "array",
						"items": {
							"type": "string"
						},
						"minItems": 4, // reel aperture
						"maxItems": 4
					},
					"minItems": 5, // reel count
					"maxItems": 5
				},
				"winlines": {
					"type": "object",
					"properties": {
						"win": {
							"type": "integer",
							"minimum": 0
						},
						"items": {
							"type": "array",
							"items": {
								"type": "object",
								"properties": {
									"win": {
										"type": "integer",
										"minimum": 0
									},
									"symbol": {
										"type": "string"
									},
									"run": {
										"type": "integer",
										"minimum": 2,
										"maximum": 5
									},
									"winline": {
										"type": "integer",
										"minimum": 0,
										"maximum": 20
									}
								}
							},
							"minItems": 0,
							"maxItems": 20,
							"uniqueItems": true
						}
					}
				},
				"scatters": {
					"type": "object",
					"properties": {
						"win": {
							"type": "integer",
							"minimum": 0
						},
						"items": {
							"type": "array",
							"minItems": 0,
							"maxItems": 1,
							"items": {
								"type": "object",
								"properties": {
									"win": {
										"type": "integer",
										"minimum": 0
									},
									"symbol": {
										"type": "string"
									},
									"positions": {
										"type": "array",
										"items": {
											"type": "object",
											"properties": {
												"symbol": {
													"type": "string"
												},
												"reel": {
													"type": "integer",
													"minimum": 0,
													"maximum": 4
												},
												"row": {
													"type": "integer",
													"minimum": 0,
													"maximum": 3
												}
											}
										},
										"minItems": 0,
										"maxItems": 6
									}
								}
							}
						}
					}
				}
			}
		},
		"bonus": {
			"type": "object",
			"properties": {
				"reelModifierWin": {
					// "Winning Reel Bonus" - when the arc opens fully during a reel spin
					"type": "object",
					"properties": {
						"type": {
							"type": "string",
							"enum": ["Bonus", "HighPayingSymbol"]
						},
						"isBonusAwarded": {
							"type": "boolean"
						},
						"symbols": {
							"type": "array",
							"maxItems": 20,
							"items": {
								"type": "object",
								"properties": {
									"reel": {
										"type": "integer",
										"min": 0,
										"max": 4
									},
									"row": {
										"type": "integer",
										"min": 0,
										"max": 3
									},
									"symbol": {
										"type": "string",
										"enums": ["LO", "H1", "H2", "WI"]
									}
								}
							}
						}
					}
				},
				"bonusEntryPick": {
					"type": "object",
					"properties": {
						"result": {
							"type": "string",
							"enum": ["aceBonus", "chipBonus", "chipAceBonus", "scaredyCatBonus", "snakePitBonus", "goldenScratchPost"]
						},
						// As the player selects boxes, they are permanently removed (until they are reset when a bonus is won). This keeps track of that
						"rewards": {
							"type": "array",
							"items": {
								"type": "string",
								"enum": ["aceBonus", "chipBonus", "chipAceBonus", "scaredyCatBonus", "snakePitBonus", "goldenScratchPost", "goldenPaw"]
							},
							"minItems": 0,
							"maxItems": 4
						},
						"forced": {
							"type": "boolean"
						}
					}
				},
				"aceBonusAward": {
					"type": "object",
					"properties": {
						"spinsTotal": {
							"type": "integer",
							"minimum": 0,
							"maximum": 5
						},
						"numberOfWilds": {
							"type": "integer",
							"minimum": 3,
							"maximum": 5
						}
					}
				},
				"chipBonusAward": {
					"type": "object",
					"properties": {
						// Chosen golden symbol
						"goldenSymbol": {
							"type": "string",
							"enum": ["LO", "H1", "H2", "M1", "M2", "AC", "KI", "QU", "JA", "TE"]
						},
						"spinsTotal": {
							"type": "integer",
							"minimum": 1
						},
						"numberOfGoldenSymbols": {
							"type": "integer",
							"minimum": 4,
							"maximum": 6
						}
					}
				},
				"chipAceBonusAward": {
					"type": "object",
					"properties": {
						"spinsTotal": {
							"type": "integer",
							"minimum": 3,
							"maximum": 5
						}
					}
				},
				"scaredyCatBonusAward": {
					"type": "object",
					"properties": {
						// amount of cash the player has to distribute
						"cashRemaining": {
							"type": "integer",
							"minimum": 0
						},
						"exitPrize": {
							"type": "integer",
							"minimum": 0,
							"maximum": 100000 // maxStake * 10
						}
					}
				},
				"snakePitAward": {
					"type": "object",
					"properties": {
						"autoCollect": {
							"type": "boolean"
						},
						"eliminated": {
							"type": "array",
							"items": {
								"type": "number",
								"minimum": 0
							},
							"maxItems": 12
						},
						"remaining": {
							"type": "array",
							"items": {
								"type": "number",
								"minimum": 0
							},
							"maxItems": 12
						},
						"offer": {
							"type": "integer",
							"minimum": 0
						}
					}
				},
				"goldenScratchPost": {
					"type": "object",
					"properties": {
						"win": {
							"type": "integer",
							"minimum": 0
						},
						"multiplier": {
							"type": "integer",
							"enum": [75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 130, 140, 150, 200, 250, 400, 500]
						}
					}
				}
			}
		},
		"decision": {
			"type": "object",
			"properties": {
				"name": {
					"type": "string",
					"enum": ["snakePitAcceptOrReject", "scaredyCatBonusPicks"]
				}
			}
		},
		"win": {
			"type": "integer",
			"minimum": 0
		},
		"cappedWin": {
			"type": "integer",
			"minimum": 0,
			"maximum": 25000000
		},
		"checkpointType": {
			"type": "string",
			"enum": ["spin", "cappedWin"]
		},
		"nextPhase": {
			"type": "array",
			"items": {
				"type": "string",
				"enum": ["checkpoint", "end"]
			},
			"minItems": 1,
			"maxItems": 2
		}
	}
};


const tests = {
	"betresult": {
		schema: schema,
		inputs: {
			"0": json
		}
	}
};

execute.only( 'Real example tests', tests, { strict: true } );
