import {currentRoundSelector, tournamentSettingsSelector} from "../recoil/selectors";
import {useRecoilValue} from "recoil";
import {Round} from "../types/round";
import {useEffect, useState} from "react";
import {TournamentSettings} from "../types/tournament-settings";
import {useNavigate} from "react-router-dom";
import {SingleRound} from "../components/SingleRound";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function ExistingTournamentPage() {
    const navigate = useNavigate();
    const tournamentSettings: TournamentSettings | null = useRecoilValue(tournamentSettingsSelector);
    const currentRound = useRecoilValue<Round | null>(currentRoundSelector);
    const [canRender, setCanRender] = useState(false);

    useEffect(() => {
        if (tournamentSettings === null || currentRound === null) {
            navigate('/');
        } else {
            setCanRender(true);
        }
    }, []);

    if (!canRender) {
        return <>Loading...</>;
    }

    return <div className='container-sm' style={{textAlign: 'center'}}>
        <button className={'btn btn-primary'} onClick={() => navigate('/vsetky-kola')}>
            <FontAwesomeIcon icon={["fas", "chart-line"]} /> Všetky výsledky
        </button>
        <h2 style={{textAlign: "center", marginBottom: '1em'}}>{currentRound!.number}. kolo</h2>
        <SingleRound round={currentRound!} editable={true}/>
    </div>


}
