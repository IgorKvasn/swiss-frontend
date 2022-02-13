import {useRecoilValue} from "recoil";
import React, {Fragment, useEffect, useMemo, useState} from "react";
import {Tournament} from "../types/tournament";
import {tournamentState} from "../recoil/atoms";
import {useNavigate} from "react-router-dom";
import {Player} from "../types/player";
import styles from './PlayersPage.module.scss';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Loading} from "../components/Loading";

export function PlayersPage() {
    const navigate = useNavigate();
    const [canRender, setCanRender] = useState(false);

    const currentTournament = useRecoilValue<Tournament | null>(tournamentState);
    const sortedPlayers = useMemo(() => {
        if (!currentTournament) {
            return [];
        }
        let players = [...currentTournament.players];
        return players.sort((p1: Player, p2: Player) => {
            return p1.points - p2.points;
        });
    }, [currentTournament?.players]);

    useEffect(() => {
        if (currentTournament === null) {
            navigate('/');
        } else {
            setCanRender(true);
        }
    }, []);

    if (!canRender) {
        return <Loading/>;
    }

    function playerClass(p: Player, index: number): string {
        return `${index === 0 ? styles.firstPlayer : ''}
                    ${index < 3 ? styles.top3Players : ''}
                    ${index === 2 ? styles.thirdPlayer : ''}
                    `;
    }


    return <div className='container-sm'>
        <h2 style={{textAlign: "center", marginBottom: '1em'}}>Hráči a výsledky</h2>

        <div className='container-sm'>
            <div style={{display: 'grid', gridAutoRows: "auto", gridTemplateColumns: '60px max-content 60px 60px', justifyContent: 'center'}}>

                {sortedPlayers?.map((p: Player, index: number) => {
                    return <Fragment key={p.id}>
                        <div className={playerClass(p, index)} style={{textAlign: 'center'}}>{index + 1}.</div>
                        <div className={playerClass(p, index)} style={{marginRight: '2em'}}>
                            <span className={`${styles.playerName}`}>{p.name}</span>
                            {index === 0 && (
                            <FontAwesomeIcon icon={['fas', 'crown']}/>
                                )}
                        </div>
                        <div className={playerClass(p, index)}>
                            {p.points}b.
                        </div>

                        <div className={playerClass(p, index)}>
                            {p.scoreToString}
                        </div>
                    </Fragment>;
                })}
            </div>
        </div>

    </div>
}
