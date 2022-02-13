import {useRecoilValue, useSetRecoilState} from "recoil";
import React, {Fragment, useEffect, useMemo, useState} from "react";
import {Tournament} from "../types/tournament";
import {tournamentState} from "../recoil/atoms";
import {useNavigate} from "react-router-dom";
import {Player} from "../types/player";
import styles from './PlayersPage.module.scss';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Loading} from "../components/Loading";
import clone from "just-clone";
import axios from "axios";
import {generateTournamentId} from "../utils/tournament-utils";

export function PlayersPage() {
    const navigate = useNavigate();
    const [canRender, setCanRender] = useState(false);

    const currentTournament = useRecoilValue<Tournament | null>(tournamentState);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [editingPlayerOriginalName, setEditingPlayerOriginalName] = useState<string | null>(null);
    const setCurrentTournament = useSetRecoilState(tournamentState);

    const sortedPlayers = useMemo(() => {
        if (!currentTournament) {
            return [];
        }
        let players = [...currentTournament.players];
        return players.sort((p1: Player, p2: Player) => {
            return p2.points - p1.points;
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
                    ${p.retired?styles.retiredPlayer:''}
                    `;
    }

    async function onConfirmPlayer() {
        const tournamentId = generateTournamentId();
        const playerId = editingPlayer!.id;
        const name = editingPlayer!.name;
        const response = await axios.put(`/tournaments/${tournamentId}/players/${playerId}/name/${name}`);
        setCurrentTournament(response.data);
        setEditingPlayer(null);
    }

    return <div className='container-sm'>
        <h2 style={{textAlign: "center", marginBottom: '1em'}}>Hráči a výsledky</h2>

        <div className='container-sm'>
            <div style={{display: 'grid', gridAutoRows: "auto", gridTemplateColumns: '60px max-content 60px 60px 150px', justifyContent: 'center'}}>

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
                        <button style={{marginLeft: '10px'}} className={`btn btn-link ${index === 2 ? styles.thirdPlayer : ''}`}
                                onClick={()=>{setEditingPlayer(clone(p)); setEditingPlayerOriginalName(p.name);}}
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal"
                        >
                            <FontAwesomeIcon icon={["fas", "edit"]}/>
                        </button>
                    </Fragment>;
                })}
            </div>
        </div>


        <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel"
             aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Upraviť hráča: {editingPlayerOriginalName}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"
                                aria-label="Close"></button>
                    </div>
                    <div className="modal-body">

                        {editingPlayer && (<>
                            <div className="mb-3">
                                <label htmlFor="playerName" className="form-label">Meno:</label>
                                <input type="text" className="form-control" id="playerName"
                                       value={editingPlayer.name}
                                       onChange={(e)=>{setEditingPlayer({...editingPlayer, name: e.target.value})}}
                                />
                            </div>
                            {/*
                            TODO retired player - pouzit rovnaky PUT ako na premenovanie hraca
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" checked={editingPlayer.retired}
                                       onChange={(e)=>setEditingPlayer({...editingPlayer, retired: e.target.checked})}
                                       id="retiredPlayer" />
                                    <label className="form-check-label text-danger fw-bold" htmlFor="retiredPlayer">
                                        Hráč sa vzdal
                                    </label>
                            </div>*/}
                        </>
                        )}

                    </div>
                    <div className="modal-footer">

                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                                onClick={() => setEditingPlayer(null)}>Zrušiť
                        </button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal"
                                onClick={() => onConfirmPlayer()}>Potvrdiť
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
}
