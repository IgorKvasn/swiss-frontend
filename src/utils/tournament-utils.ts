export function generateTournamentId(): string {
    let date = new Date();
    return `${date.getFullYear()}-${padZeroLeft(date.getMonth()+1)}-${(padZeroLeft(date.getDate()))}`;
}

function padZeroLeft(v: number): string{
    return v <=9?`0${v}`:String(v);
}
