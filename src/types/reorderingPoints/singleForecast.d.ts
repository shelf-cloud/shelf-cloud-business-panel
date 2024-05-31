export interface SingleForecastResponse {
    [sku: string]: SingleForecast;
}

export interface SingleForecast {
    best_model: string;
    errors: Errors;
    unitsSold: { [model: string]: { [date: string]: number } };
}

export interface Errors {
    ExponentialSmoothing: number;
    AutoREG: number;
    VAR: number;
    ARDL_seasonal: number;
    ARDL: number;
    Naive: number;
    AutoARIMA: number;
}