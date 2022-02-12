import {Player} from "./player";

export interface Match {
    player1: Player;
    player2: Player;
    roundNumber: number;
    scores: MatchSet[];
    score1: number;
    score2: number;
    win1: number;
    win2: number;
}

export interface MatchSet {
    score1: number|null;
    score2: number|null;
}
