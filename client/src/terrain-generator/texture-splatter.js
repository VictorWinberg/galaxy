import * as THREE from "three";

import { LinearSpline } from "./spline.js";

// const WHITE = new THREE.Color(0x808080);

const DEEP_OCEAN = new THREE.Color(0x20020ff);
const SHALLOW_OCEAN = new THREE.Color(0x8080ff);
// const BEACH = new THREE.Color(0xd9d592);
const SNOW = new THREE.Color(0xffffff);
// const OREST_TROPICAL = new THREE.Color(0x4f9f0f);
// const OREST_TEMPERATE = new THREE.Color(0x2b960e);
// const OREST_BOREAL = new THREE.Color(0x29c100);

// const GREEN = new THREE.Color(0x80ff80);
// const RED = new THREE.Color(0xff8080);
// const BLACK = new THREE.Color(0x000000);

const sat = (x) => Math.min(Math.max(x, 0.0), 1.0);
const parametic = (x, a) => Math.pow(x, a) / (Math.pow(x, a) + Math.pow(1- x, a))

export class HeightGenerator {
  constructor(generator, position, minRadius, maxRadius) {
    this.position = position.clone();
    this.radius = [minRadius, maxRadius];
    this.generator = generator;
  }

  Get(x, y, z) {
    return [this.generator.Get(x, y, z), 1];
  }
}

export class TextureSplatter {
  constructor(params) {
    this.params = params;

    const colourLerp = (t, p0, p1) => {
      const c = p0.clone();

      return c.lerp(p1, t);
    };
    this.colourSpline = [new LinearSpline(colourLerp), new LinearSpline(colourLerp)];

    // Arid
    this.colourSpline[0].AddPoint(0.0, new THREE.Color(0x7209b7));
    this.colourSpline[0].AddPoint(0.5, new THREE.Color(0xb5179e));
    this.colourSpline[0].AddPoint(1.0, new THREE.Color(0xf72585));

    // Humid
    this.colourSpline[1].AddPoint(0.0, new THREE.Color(0x6b705c));
    this.colourSpline[1].AddPoint(0.5, new THREE.Color(0xa5a58d));
    this.colourSpline[1].AddPoint(1.0, SNOW);

    this.oceanSpline = new LinearSpline(colourLerp);
    this.oceanSpline.AddPoint(0, DEEP_OCEAN);
    this.oceanSpline.AddPoint(0.05, SHALLOW_OCEAN);
  }

  BaseColour(x, y, z) {
    const m = this.params.biomeGenerator.Get(x, y, z);
    const a = 8;

    const h = sat(z / 50.0);

    const c1 = this.colourSpline[0].Get(h);
    const c2 = this.colourSpline[1].Get(h);
    const ocean = this.oceanSpline.Get(h)
    
    let c = c1.lerp(c2, parametic(m, a));

    if (h < 0.05) {
      c = c.lerp(ocean, parametic(1.0 - h / 0.05, 3));
    }
    return c;
  }

  Colour(x, y, z) {
    const c = this.BaseColour(x, y, z);
    const r = this.params.colourNoise.Get(x, y, z) * 2.0 - 1.0;

    c.offsetHSL(0.0, 0.0, r * 0.01);
    return c;
  }

  GetTextureWeights(p, n, up) {
    const m = this.params.biomeGenerator.Get(p.x, p.y, p.z);
    const h = p.z / 100.0;

    const types = {
      dirt: { index: 0, strength: 0.0 },
      grass: { index: 1, strength: 0.0 },
      gravel: { index: 2, strength: 0.0 },
      rock: { index: 3, strength: 0.0 },
      snow: { index: 4, strength: 0.0 },
      snowrock: { index: 5, strength: 0.0 },
      cobble: { index: 6, strength: 0.0 },
      sandyrock: { index: 7, strength: 0.0 },
    };

    function ApplyWeights(dst, v, m) {
      for (let k in types) {
        types[k].strength *= m;
      }
      types[dst].strength = v;
    }

    types.grass.strength = 1.0;
    ApplyWeights("gravel", 1.0 - m, m);

    if (h < 0.2) {
      const s = 1.0 - sat((h - 0.1) / 0.05);
      ApplyWeights("cobble", s, 1.0 - s);

      if (h < 0.1) {
        const s = 1.0 - sat((h - 0.05) / 0.05);
        ApplyWeights("sandyrock", s, 1.0 - s);
      }
    } else {
      if (h > 0.125) {
        const s = sat((h - 0.125) / 1.25);
        ApplyWeights("rock", s, 1.0 - s);
      }

      if (h > 1.5) {
        const s = sat((h - 0.75) / 2.0);
        ApplyWeights("snow", s, 1.0 - s);
      }
    }

    // In case nothing gets set.
    types.dirt.strength = 0.01;

    return types;
  }

  GetColour(position) {
    return this.Colour(position.x, position.y, position.z);
  }

  GetSplat(position, normal, up) {
    return this.GetTextureWeights(position, normal, up);
  }
}
