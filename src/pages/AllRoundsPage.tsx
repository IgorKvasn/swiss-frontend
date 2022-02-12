import {tournamentSettingsSelector} from "../recoil/selectors";
import {useRecoilState, useRecoilValue} from "recoil";
import {useEffect, useState} from "react";
import {TournamentSettings} from "../types/tournament-settings";
import {Tournament} from "../types/tournament";
import {tournamentState} from "../recoil/atoms";
import {useNavigate} from "react-router-dom";
import {SingleRound} from "../components/SingleRound";


export function AllRoundsPage() {
    const navigate = useNavigate();
    const [canRender, setCanRender] = useState(false);
    const tournamentSettings: TournamentSettings | null = useRecoilValue(tournamentSettingsSelector);

    const [currentTournament, ] = useRecoilState<Tournament | null>(tournamentState);
    const [round, ] = useState(currentTournament?.rounds[0]);

    useEffect(() => {
        if (tournamentSettings === null) {
            navigate('/');
        } else {
            setCanRender(true);
        }
    }, []);

    if (!canRender) {
        return <></>;
    }

    return <div className='container-sm' style={{textAlign: 'center'}}>
        <button className={'btn btn-primary'} onClick={() => navigate('/turnaj')}>Späť</button>
        <h2 style={{textAlign: "center", marginBottom: '1em'}}>{round!.number}. kolo</h2>
        <SingleRound round={round!} editable={false}/>

        <nav aria-label="vsetky kola" style={{marginTop: '2em'}}>
            <ul className="pagination pagination-lg justify-content-center">
                {currentTournament?.rounds.map((r, index) => {
                    return <li key={r.number} className={`page-item ${round?.number === r.number ? 'active' : ''}`}
                               aria-current="page">
                        <span className="page-link">{r.number}</span>
                    </li>
                })}

            </ul>
        </nav>
    </div>
}
