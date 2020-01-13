export default interface Subtitle {
    text: string,
    time: number,
    duration: number,
    isCurrent: boolean,
		isLoop: boolean,
		startShift: number
}
