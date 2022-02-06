import {Match} from "./match";
import {Player} from "./player";

export interface Round {
    number: number;
    isLastRound: boolean;
    matches: Match[];
    beforePlayers: Player[];
    afterPlayers: Player[];
}
