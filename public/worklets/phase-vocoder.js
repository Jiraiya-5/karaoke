// Phase Vocoder AudioWorklet para cambio de tono
class PhaseVocoderProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'pitchFactor', defaultValue: 1, minValue: 0.5, maxValue: 2 }
    ]
  }

  constructor() {
    super()
    this.bufferSize = 4096
    this.hopSize = 1024
    this.buffer = new Float32Array(this.bufferSize)
    this.outputBuffer = new Float32Array(this.bufferSize)
    this.writeIndex = 0
    this.readIndex = 0
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]

    if (!input || !input[0]) return true

    const pitchFactor = parameters.pitchFactor[0]
    const inputChannel = input[0]
    const outputChannel = output[0]

    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.writeIndex] = inputChannel[i]
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize

      const readPos = (this.readIndex + i * pitchFactor) % this.bufferSize
      const readIndex = Math.floor(readPos)
      const nextIndex = (readIndex + 1) % this.bufferSize
      const frac = readPos - readIndex

      outputChannel[i] =
        this.buffer[readIndex] * (1 - frac) +
        this.buffer[nextIndex] * frac
    }

    this.readIndex = (this.readIndex + inputChannel.length * pitchFactor) % this.bufferSize

    return true
  }
}

registerProcessor('phase-vocoder-processor', PhaseVocoderProcessor)