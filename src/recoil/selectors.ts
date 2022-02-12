import {selector} from "recoil";
import {Tournament} from "../types/tournament";
import {Round} from "../types/round";
import {TournamentSettings} from "../types/tournament-settings";
import {tournamentState} from "./atoms";

export const currentRoundSelector = selector<Round | null>({
    key: 'CurrentRound',
    get: ({get}) => {
        const tournament: Tournament | null = get(tournamentState);
        if (!tournament){
            return null;
        }
        return tournament.rounds[tournament.rounds.length - 1];
    }
});

export const tournamentSettingsSelector = selector<TournamentSettings | null>({
    key: 'TournamentSettingsSelector',
    get: ({get}) => {
        const tournament: Tournament | null = get(tournamentState);
        if (!tournament){
            return null;
        }
        return tournament.settings;
    },
});
