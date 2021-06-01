/// <reference types="react-scripts" />

declare module 'audio-loader' {
  export default function(path: string): Promise<AudioBuffer>
}

declare module 'audio-play' {
  export default function(buffer: AudioBuffer, options?: any): void
}
