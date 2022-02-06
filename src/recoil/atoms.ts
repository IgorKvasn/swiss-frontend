import { atom } from "recoil";
import {Tournament} from "../types/tournament";
import {currentTournament} from "./selectors";

export const tournamentState = atom<Tournament | null>({
    key: "tournamentState",
    default: currentTournament,
});
