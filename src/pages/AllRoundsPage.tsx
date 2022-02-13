import {tournamentSettingsSelector} from "../recoil/selectors";
import {useRecoilValue} from "recoil";
import React, {useEffect, useRef, useState} from "react";
import {TournamentSettings} from "../types/tournament-settings";
import {Tournament} from "../types/tournament";
import {tournamentState} from "../recoil/atoms";
import {useNavigate} from "react-router-dom";
import {SingleRound} from "../components/SingleRound";
import styles from './AllRoundsPage.module.scss';
import {Loading} from "../components/Loading";
// @ts-ignore
import handyScroll from 'handy-scroll';
import 'handy-scroll/dist/handy-scroll.css';


export function AllRoundsPage() {
    const navigate = useNavigate();
    const [canRender, setCanRender] = useState(false);
    const tournamentSettings: TournamentSettings | null = useRecoilValue(tournamentSettingsSelector);

    const currentTournament = useRecoilValue<Tournament | null>(tournamentState);
    const [round, setRound] = useState(currentTournament?.rounds[0]);
    const desktopRoundsElement = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (tournamentSettings === null) {
            navigate('/');
        } else {
            setCanRender(true);
        }
    }, []);

    useEffect(() => {
        if (!canRender){
            return;
        }
        if (desktopRoundsElement.current !== null) {
            // handyScroll.mount(desktopRoundsElement.current);
        }

        return () => {
            handyScroll.destroy(desktopRoundsElement.current);
        }
    }, [canRender, desktopRoundsElement.current]);

    useEffect(() => {
        if (!canRender){
            return;
        }
        if (desktopRoundsElement.current !== null) {
            console.log('upadte');
            handyScroll.update(desktopRoundsElement.current);
        }
    }, [canRender, currentTournament?.rounds, desktopRoundsElement.current]);

    if (!canRender) {
        return <Loading/>;
    }

    return <div className='container-sm' style={{textAlign: 'center'}}>
        <div className={styles.mobileRounds}>
            <h2 style={{
                textAlign: "center",
                marginBottom: '1em'
            }}>Kolo {round!.number}/{currentTournament?.rounds.length}</h2>

            <nav aria-label="vsetky kola" style={{marginBottom: '2em'}}>
                <ul className="pagination pagination-lg justify-content-center">
                    {currentTournament?.rounds.map((r, index) => {
                        return <li key={r.number} className={`page-item ${round?.number === r.number ? 'active' : ''}`}
                                   aria-current="page" onClick={() => setRound(currentTournament?.rounds[index])}>
                            <span className="page-link">{r.number}</span>
                        </li>
                    })}

                </ul>
            </nav>

            <SingleRound round={round!} editable={false}/>

            <nav aria-label="vsetky kola" style={{marginTop: '2em'}}>
                <ul className="pagination pagination-lg justify-content-center">
                    {currentTournament?.rounds.map((r, index) => {
                        return <li key={r.number} className={`page-item ${round?.number === r.number ? 'active' : ''}`}
                                   aria-current="page" onClick={() => setRound(currentTournament?.rounds[index])}>
                            <span className="page-link">{r.number}</span>
                        </li>
                    })}

                </ul>
            </nav>
        </div>

        <div  ref={desktopRoundsElement} style={{  maxWidth: '60vw', overflowX: 'auto'}}>
        <div className={styles.desktopRounds}>
            {currentTournament?.rounds.map((round, index) => {
                return <div key={round.number}>
                    <h3>{round.number}. kolo</h3>
                    <SingleRound round={round!} editable={false}/>
                </div>
            })}
        </div>
        </div>
    </div>
}
