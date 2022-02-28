import { SimplexNoise } from "./simplex-noise.js";

export class Noise {
  constructor(params) {
    this._params = params;
    this._Init();
  }

  _Init() {
    this._noise = new SimplexNoise(this._params.seed);
  }

  Get(x, y, z) {
    const { persistence, scale, octaves, lacunarity, exponentiation, height } = this._params;
    const G = 2.0 ** -persistence;
    const xs = x / scale;
    const ys = y / scale;
    const zs = z / scale;
    const noiseFunc = this._noise;

    let amplitude = 1.0;
    let frequency = 1.0;
    let normalization = 0;
    let total = 0;
    for (let o = 0; o < octaves; o++) {
      const noiseValue = noiseFunc.noise3D(xs * frequency, ys * frequency, zs * frequency) * 0.5 + 0.5;

      total += noiseValue * amplitude;
      normalization += amplitude;
      amplitude *= G;
      frequency *= lacunarity;
    }
    total /= normalization;
    return Math.pow(total, exponentiation) * height;
  }
}
