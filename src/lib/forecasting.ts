export function singleExponentialSmoothing(data: number[], alpha: number): { forecasts: number[]; nextForecast: number } {
  if (data.length === 0) return { forecasts: [], nextForecast: 0 };
  const forecasts: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    const nextF = forecasts[i - 1] + alpha * (data[i - 1] - forecasts[i - 1]);
    forecasts.push(nextF);
  }
  const nextForecast = forecasts[forecasts.length - 1] + alpha * (data[data.length - 1] - forecasts[forecasts.length - 1]);
  return { forecasts, nextForecast };
}

export function movingAverage(data: number[], n: number): { forecasts: number[]; nextForecast: number } {
  if (data.length < n) return { forecasts: [], nextForecast: data[data.length - 1] || 0 };
  const forecasts: number[] = new Array(n).fill(0);
  for (let i = n; i < data.length; i++) {
    const slice = data.slice(i - n, i);
    const avg = slice.reduce((a, b) => a + b, 0) / n;
    forecasts.push(avg);
  }
  const lastSlice = data.slice(data.length - n);
  const nextForecast = lastSlice.reduce((a, b) => a + b, 0) / n;
  return { forecasts, nextForecast };
}

export function calculateMAPE(actual: number[], forecasted: number[]): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== 0 && forecasted[i] !== undefined) {
      sum += Math.abs((actual[i] - forecasted[i]) / actual[i]);
      count++;
    }
  }
  return count === 0 ? 0 : (sum / count) * 100;
}
