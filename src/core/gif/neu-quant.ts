/* NeuQuant Neural-Net Quantization Algorithm
 * ------------------------------------------
 *
 * Copyright (c) 1994 Anthony Dekker
 *
 * NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994.
 * See "Kohonen neural networks for optimal colour quantization"
 * in "Network: Computation in Neural Systems" Vol. 5 (1994) pp 351-367.
 * for a discussion of the algorithm.
 * See also  http://members.ozemail.com.au/~dekker/NEUQUANT.HTML
 *
 * Any party obtaining a copy of these files from the author, directly or
 * indirectly, is granted, free of charge, a full and unrestricted irrevocable,
 * world-wide, paid up, royalty-free, nonexclusive right and license to deal
 * in this software and documentation files (the "Software"), including without
 * limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons who receive
 * copies from any such party to do so, with the only requirement being
 * that this copyright notice remain intact.
 *
 * (JavaScript port 2012 by Johan Nordberg)
 * (TypeScript port 2017 by LancerComet)
 */

const ncycles = 100 // number of learning cycles
const netsize = 256 // number of colors used
const maxnetpos = netsize - 1

// defs for freq and bias
const netbiasshift = 4 // bias for colour values
const intbiasshift = 16 // bias for fractions
const intbias = (1 << intbiasshift)
const gammashift = 10
const gamma = (1 << gammashift)
const betashift = 10
const beta = (intbias >> betashift) /* beta = 1/1024 */
const betagamma = (intbias << (gammashift - betashift))

// defs for decreasing radius factor
const initrad = (netsize >> 3) // for 256 cols, radius starts
const radiusbiasshift = 6 // at 32.0 biased by 6 bits
const radiusbias = (1 << radiusbiasshift)
const initradius = (initrad * radiusbias) //and decreases by a
const radiusdec = 30 // factor of 1/30 each cycle

// defs for decreasing alpha factor
const alphabiasshift = 10 // alpha starts at 1.0
const initalpha = (1 << alphabiasshift)

/* radbias and alpharadbias used for radpower calculation */
const radbiasshift = 8
const radbias = (1 << radbiasshift)
const alpharadbshift = (alphabiasshift + radbiasshift)
const alpharadbias = (1 << alpharadbshift)

// four primes near 500 - assume no image has a length so large that it is
// divisible by all four primes
const prime1 = 499
const prime2 = 491
const prime3 = 487
const prime4 = 503
const minpicturebytes = (3 * prime4)

class NeuQuant {
  private pixels: any
  private samplefac: any

  private network: Array<Float64Array> = []  // int[netsize][4]
  private netindex = new Int32Array(256)  // for network lookup - really 256

  // bias and freq arrays for learning
  private bias = new Int32Array(netsize)
  private freq = new Int32Array(netsize)
  private radpower = new Int32Array(netsize >> 3)

  private init () {
    let v = 0
    for (let i = 0; i < netsize; i++) {
      v = (i << (netbiasshift + 8)) / netsize
      this.network[i] = new Float64Array([v, v, v, 0])
      // network[i] = [v, v, v, 0]
      this.freq[i] = intbias / netsize
      this.bias[i] = 0
    }
  }

  /**
   * Main Learning Loop.
   *
   * @private
   * @memberof NeuQuant
   */
  private learn () {
    const pixels = this.pixels
    let samplefac = this.samplefac

    let i = 0

    const lengthcount = pixels.length
    const alphadec = 30 + ((samplefac - 1) / 3)
    const samplepixels = lengthcount / (3 * samplefac)
    let delta = ~~(samplepixels / ncycles)
    let alpha = initalpha
    let radius = initradius

    let rad = radius >> radiusbiasshift
    if (rad <= 1) {
      rad = 0
    }

    for (i = 0; i < rad; i++) {
      this.radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad))
    }

    let step
    if (lengthcount < minpicturebytes) {
      samplefac = 1
      step = 3
    } else if ((lengthcount % prime1) !== 0) {
      step = 3 * prime1
    } else if ((lengthcount % prime2) !== 0) {
      step = 3 * prime2
    } else if ((lengthcount % prime3) !== 0)  {
      step = 3 * prime3
    } else {
      step = 3 * prime4
    }

    let b = 0
    let g = 0
    let r = 0
    let j = 0
    let pix = 0  // current pixel

    i = 0;
    while (i < samplepixels) {
      b = (pixels[pix] & 0xff) << netbiasshift
      g = (pixels[pix + 1] & 0xff) << netbiasshift
      r = (pixels[pix + 2] & 0xff) << netbiasshift

      j = this.contest(b, g, r)

      this.altersingle(alpha, j, b, g, r)

      if (rad !== 0) {
        this.alterneigh(rad, j, b, g, r)  // alter neighbours
      }

      pix += step

      if (pix >= lengthcount) {
        pix -= lengthcount
      }

      i++

      if (delta === 0) {
        delta = 1
      }

      if (i % delta === 0) {
        alpha -= alpha / alphadec;
        radius -= radius / radiusdec;
        rad = radius >> radiusbiasshift;

        if (rad <= 1) rad = 0;
        for (j = 0; j < rad; j++) {
          this.radpower[j] = alpha * (((rad * rad - j * j) * radbias) / (rad * rad))
        }
      }
    }
  }

  /**
   * unbiases network to give byte values 0..255 and record position i to prepare for sort
   *
   * @private
   * @memberof NeuQuant
   */
  private unbiasnet () {
    for (let i = 0; i < netsize; i++) {
      this.network[i][0] >>= netbiasshift
      this.network[i][1] >>= netbiasshift
      this.network[i][2] >>= netbiasshift
      this.network[i][3] = i // record color number
    }
  }

  /**
   * Sorts network and builds netindex[0..255]
   *
   * @private
   * @memberof NeuQuant
   */
  private inxbuild () {
    let j = 0
    let p = []
    let q = []
    let smallpos = 0
    let smallval = 0
    let previouscol = 0
    let startpos = 0
    for (let i = 0; i < netsize; i++) {
      p = this.network[i]
      smallpos = i
      smallval = p[1] // index on g
      // find smallest in i..netsize-1
      for (j = i + 1; j < netsize; j++) {
        q = this.network[j]
        if (q[1] < smallval) { // index on g
          smallpos = j
          smallval = q[1] // index on g
        }
      }
      q = this.network[smallpos]
      // swap p (i) and q (smallpos) entries
      if (i != smallpos) {
        j = q[0];   q[0] = p[0];   p[0] = j;
        j = q[1];   q[1] = p[1];   p[1] = j;
        j = q[2];   q[2] = p[2];   p[2] = j;
        j = q[3];   q[3] = p[3];   p[3] = j;
      }
      // smallval entry is now in position i

      if (smallval != previouscol) {
        this.netindex[previouscol] = (startpos + i) >> 1
        for (j = previouscol + 1; j < smallval; j++) {
          this.netindex[j] = i
        }
        previouscol = smallval
        startpos = i
      }
    }

    this.netindex[previouscol] = (startpos + maxnetpos) >> 1;

    for (let j = previouscol + 1; j < 256; j++) {
      this.netindex[j] = maxnetpos // really 256
    }
  }

  /**
   * Moves neuron *i* towards biased (b,g,r) by factor *alpha*
   *
   * @private
   * @param {any} alpha
   * @param {any} i
   * @param {any} b
   * @param {any} g
   * @param {any} r
   * @memberof NeuQuant
   */
  private altersingle (alpha, i, b, g, r) {
    this.network[i][0] -= (alpha * (this.network[i][0] - b)) / initalpha
    this.network[i][1] -= (alpha * (this.network[i][1] - g)) / initalpha
    this.network[i][2] -= (alpha * (this.network[i][2] - r)) / initalpha
  }

  /**
   * Searches for biased BGR values
   *
   * @private
   * @param {number} b
   * @param {number} g
   * @param {number} r
   * @returns {number}
   * @memberof NeuQuant
   */
  private contest (b: number, g: number, r: number): number {
    /*
      finds closest neuron (min dist) and updates freq
      finds best neuron (min dist-bias) and returns position
      for frequently chosen neurons, freq[i] is high and bias[i] is negative
      bias[i] = gamma * ((1 / netsize) - freq[i])
    */
    let bestd = ~(1 << 31)
    let bestbiasd = bestd
    let bestpos = -1
    let bestbiaspos = bestpos

    for (let i = 0; i < netsize; i++) {
      let n: Float64Array = this.network[i]
      const dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r)

      if (dist < bestd) {
        bestd = dist
        bestpos = i
      }

      const biasdist = dist - ((this.bias[i]) >> (intbiasshift - netbiasshift))
      if (biasdist < bestbiasd) {
        bestbiasd = biasdist
        bestbiaspos = i
      }

      const betafreq = (this.freq[i] >> betashift);
      this.freq[i] -= betafreq;
      this.bias[i] += (betafreq << gammashift);
    }

    this.freq[bestpos] += beta;
    this.bias[bestpos] -= betagamma;

    return bestbiaspos
  }

  /**
   * Moves neurons in *radius* around index *i* towards biased (b,g,r) by factor *alpha*
   *
   * @private
   * @param {any} radius
   * @param {any} i
   * @param {any} b
   * @param {any} g
   * @param {any} r
   * @memberof NeuQuant
   */
  private alterneigh (radius, i, b, g, r) {
    const lo = Math.abs(i - radius)
    const hi = Math.min(i + radius, netsize)

    let j = i + 1
    let k = i - 1
    let m = 1

    let p = []
    let a = 0

    while ((j < hi) || (k > lo)) {
      a = this.radpower[m++]

      if (j < hi) {
        p = this.network[j++]
        p[0] -= (a * (p[0] - b)) / alpharadbias
        p[1] -= (a * (p[1] - g)) / alpharadbias
        p[2] -= (a * (p[2] - r)) / alpharadbias
      }

      if (k > lo) {
        p = this.network[k--]
        p[0] -= (a * (p[0] - b)) / alpharadbias
        p[1] -= (a * (p[1] - g)) / alpharadbias
        p[2] -= (a * (p[2] - r)) / alpharadbias
      }
    }
  }

  constructor (pixels, samplefac) {
    this.pixels = pixels
    this.samplefac = samplefac

    /**
     * 1. initializes network
     * 2. trains it
     * 3. removes misconceptions
     * 4. builds colorindex
     */
    this.init()
    this.learn()
    this.unbiasnet()
    this.inxbuild()
  }

  /**
   * Builds colormap from the index
   * returns array in the format:
   * [r, g, b, r, g, b, r, g, b, ..]
   *
   * @memberof NeuQuant
   */
  getColormap (): number[] {
    const map: number[] = []
    const index: number[] = []

    for (let i = 0; i < netsize; i++) {
      index[this.network[i][3]] = i
    }

    let j = 0
    for (let k = 0; k < netsize; k++) {
      const data: Float64Array = this.network[index[k]]
      map[j++] = data[0]
      map[j++] = data[1]
      map[j++] = data[2]
    }

    return map
  }

  /**
   * Searches for BGR values 0..255 and returns a color index
   * looks for the closest *r*, *g*, *b* color in the map and returns its index
   *
   * @param {number} b
   * @param {number} g
   * @param {number} r
   * @returns {number}
   * @memberof NeuQuant
   */
  lookupRGB (b: number, g: number, r: number): number {
    let a = 0
    let p: Float64Array = null
    let dist = 0

    let bestd = 1000  // biggest possible dist is 256*3
    let best = -1

    let i = this.netindex[g]  // index on g
    let j = i - 1  // start at netindex[g] and work outwards

    while ((i < netsize) || (j >= 0)) {
      if (i < netsize) {
        p = this.network[i]
        dist = p[1] - g; // inx key
        if (dist >= bestd) {
          i = netsize // stop iter
        } else {
          i++
          if (dist < 0) {
            dist = -dist
          }
          a = p[0] - b
          if (a < 0) {
            a = -a
          }
          dist += a
          if (dist < bestd) {
            a = p[2] - r
            if (a < 0) {
              a = -a
            }
            dist += a
            if (dist < bestd) {
              bestd = dist
              best = p[3]
            }
          }
        }
      }

      if (j >= 0) {
        p = this.network[j]
        dist = g - p[1] // inx key - reverse dif
        if (dist >= bestd) {
          j = -1 // stop iter
        } else {
          j--
          if (dist < 0) {
            dist = -dist
          }
          a = p[0] - b
          if (a < 0) {
            a = -a
          }
          dist += a
          if (dist < bestd) {
            a = p[2] - r
            if (a < 0) {
              a = -a
            }
            dist += a
            if (dist < bestd) {
              bestd = dist
              best = p[3]
            }
          }
        }
      }
    }

    return best
  }
}

export {
  NeuQuant
}
