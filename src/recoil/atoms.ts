import { atom } from "recoil";
import {Tournament} from "../types/tournament";

export const tournamentState = atom<Tournament | null>({
    key: "tournamentState",
    default: null
});

export const newTournamentState = atom<Tournament | null>({
    key: "newTournamentState",
    default: null
});
