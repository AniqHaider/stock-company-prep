export interface Quote {
	symbol: string;
	ltp: number;
	prevClose: number;
	ts: number;
}

export interface Analytics {
	sma20: number;
	volatility: number;
	samples: number;
}
