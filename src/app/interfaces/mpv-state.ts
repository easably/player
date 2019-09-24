import Track from './track'
export default interface MpvState {
        pause: boolean,
        "time-pos": number,
        duration: number,
        fullscreen: boolean,
        speed: number,
        trackList: Track[],
        filename: string,
        path: string
}
