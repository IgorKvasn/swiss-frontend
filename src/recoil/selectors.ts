import {selector} from "recoil";
import axios from "axios";
import {Tournament} from "../types/tournament";
import {generateTournamentId} from "../utils/tournament-utils";

export const currentTournament = selector<Tournament>({
    key: 'CurrentTournament',
    get: async ({get}) => {
        try {
            const response = await axios.get(`/api/tournaments/${generateTournamentId()}`);
            return response.data || null;
        } catch (error) {
            return null;
        }

    },
});
