export interface Player {
    id: string;
    name: string;

    dummy: boolean;
    retired: boolean;

   points: number;
   score1: number;
   score2: number;

    scoreToString: string;
}
