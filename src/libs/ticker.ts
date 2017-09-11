/**
 * Run requestAnimationFrame in limited frame rate.
 *
 * @class Ticker
 */
class Ticker {
  private fps: number
  private fpsInterval: number
  private callback: Function
  private rafID: any
  private i: number

  start () {
    this.i = this.fpsInterval
    this.tick()
  }

  stop () {
    cancelAnimationFrame(this.rafID)
  }

  private tick () {
    if (this.i > 0) {
      this.i -= 16.6667
    } else {
      this.callback()
      this.i = this.fpsInterval
    }
    this.rafID = requestAnimationFrame(this.tick.bind(this))
  }

  constructor (fps: number, callback: Function) {
    this.fps = fps > 60 ? 60 : fps
    this.fpsInterval = 1000 / fps
    this.callback = callback
  }
}

export {
  Ticker
}
