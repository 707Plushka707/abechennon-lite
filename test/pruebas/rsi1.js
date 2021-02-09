[{
        "id": "1",
        "name": "Relative Strength Index (RSI)",
        "type": "buy",
        "params": {
            "candle_value": {
                "type": "select",
                "name": "OHLCV Value",
                "options": ["open", "close", "high", "low", "volume"],
                "default": "close"
            },
            "period": {
                "type": "number",
                "step": 1,
                "min": 1,
                "max": 500,
                "name": "RSI Period",
                "default": 14,
                "value": "3"
            },
            "signal_when": {
                "type": "value",
                "defaults": {
                    "buy": {
                        "signal_when": "<=",
                        "signal_when_value": 20
                    },
                    "sell": {
                        "signal_when": ">=",
                        "signal_when_value": 80
                    }
                },
                "signal_when_value": "15"
            }
        },
        "chartperiod": "900",
        "candle_pattern": 0,
        "necessary": 0,
        "keep_signal": 0
    },

    {
        "id": "1",
        "name": "Relative Strength Index (RSI)",
        "type": "sell",
        "params": {
            "candle_value": {
                "type": "select",
                "name": "OHLCV Value",
                "options": ["open", "close", "high", "low", "volume"],
                "default": "close"
            },
            "period": {
                "type": "number",
                "step": 1,
                "min": 1,
                "max": 500,
                "name": "RSI Period",
                "default": 14,
                "value": "3"
            },
            "signal_when": {
                "type": "value",
                "defaults": {
                    "buy": {
                        "signal_when": "<=",
                        "signal_when_value": 20
                    },
                    "sell": {
                        "signal_when": ">=",
                        "signal_when_value": 80
                    }
                },
                "signal_when_value": "85",
                "signal_when": ">="
            }
        },
        "chartperiod": "900",
        "candle_pattern": 0,
        "necessary": 0,
        "keep_signal": 0
    }
]