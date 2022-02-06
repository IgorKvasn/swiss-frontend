import { Player } from "./player";
import {TournamentSettings} from "./tournament-settings";
import {Match} from "./match";
import {Round} from "./round";

export interface Tournament {
    id: Date;
    players: Player[];
    rounds: Round[]
    allMatches: Match[]
    settings: TournamentSettings;
}
