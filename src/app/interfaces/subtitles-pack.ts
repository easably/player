import Subtitle from './subtitle'
export default interface SubtitlesPack {
    language: string,
    number: number,
    subtitle: Subtitle[],
    subtitleShift: number,
    type: string
}
