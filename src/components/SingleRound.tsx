import {Fragment, useState} from "react";
import {TournamentSettings} from "../types/tournament-settings";
import {useRecoilState, useRecoilValue} from "recoil";
import {tournamentSettingsSelector} from "../recoil/selectors";
import {Round} from "../types/round";
import {Tournament} from "../types/tournament";
import {tournamentState} from "../recoil/atoms";
import {Match, MatchSet} from "../types/match";
import {generateTournamentId} from "../utils/tournament-utils";
import axios from "axios";
import clone from "just-clone";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Player} from "../types/player";
import styles from "../pages/ExistingTournament.module.scss";

function isNone(v: any): boolean {
    return v === null || typeof v === 'undefined';
}

export function SingleRound({round, editable}: { round: Round, editable: boolean }) {

    const tournamentSettings: TournamentSettings | null = useRecoilValue(tournamentSettingsSelector);
    const [currentTournament, setCurrentTournament] = useRecoilState<Tournament | null>(tournamentState);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);

    function onMatchSelected(match: Match) {
        let m: Match = clone({...match});
        if (m.scores === null) {
            m.scores = [];
        }
        for (let i = m.scores.length; i < tournamentSettings!.maxSets; i++) {
            m.scores.push({score1: null, score2: null} as MatchSet);
        }

        setEditingMatch(m);
    }

    function onScoreChanged(scores: MatchSet[]) {
        setEditingMatch({...editingMatch!, scores: scores});
    }

    function onConfirmMatch() {
        let tournamentId = generateTournamentId();
        let roundNo = round.number;
        let scores = editingMatch!.scores;
        for (let i = scores.length - 1; i >= 0; i--) {
            if (isNone(scores[i].score1) && isNone(scores[i].score2)) {
                scores.splice(i, 1);
            } else {
                break;
            }
        }

        axios.put(`tournaments/${tournamentId}/rounds/${roundNo}/matches?player1=${editingMatch!.player1.id}&player2=${editingMatch!.player2.id}`,
            scores
        ).then(() => {
            let newTournament = clone(currentTournament!);
            let match = newTournament.rounds[newTournament.rounds.length - 1].matches.find(m => m.player1.id === editingMatch!.player1.id && m.player2.id === editingMatch!.player2.id);
            match!.scores = editingMatch!.scores;
            setCurrentTournament(newTournament);
            setEditingMatch(null);
        });

    }

    async function onStartNextRound() {
        const response = await axios.get(`/tournaments/${generateTournamentId()}?newRound=true`);
        setCurrentTournament(response.data);
    }


    return <>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1em'}}>
            {round.matches.map((match) => {
                return <MatchComponent key={`${match.player1.id}-${match.player2.id}`}
                                       match={match}
                                       editable={editable}
                                       onMatchSelected={(m) => onMatchSelected(m)}/>
            })}
        </div>

        {editable &&
            <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel"
                 aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">V??sledok z??pasu</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">

                            {editingMatch && (
                                <EditingMatch match={editingMatch}
                                              scores={editingMatch.scores}
                                              onScoreChanged={onScoreChanged}/>
                            )}

                        </div>
                        <div className="modal-footer">

                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                                    onClick={() => setEditingMatch(null)}>Zru??i??
                            </button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal"
                                    onClick={() => onConfirmMatch()}>Potvrdi??
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        }

        {editable && <>
            <button className={'btn btn-success'} style={{marginTop: '2em'}}
                    data-bs-toggle="modal"
                    data-bs-target="#nextRoundConfirmModel"><FontAwesomeIcon icon={["fas", "arrow-right"]}/> Za??a??
                ??al??ie kolo
            </button>

            <div className="modal fade" id="nextRoundConfirmModel" tabIndex={-1}
                 aria-labelledby="nextRoundConfirmModelLabel"
                 aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">??al??ie kolo</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Naozaj chcete za??a?? ??al??ie kolo?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Nie, e??te nie
                            </button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal"
                                    onClick={() => onStartNextRound()}>??no, hrajme!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
        }
    </>
}

function MatchComponent({
                            match,
                            onMatchSelected,
                            editable
                        }: { match: Match, editable: boolean, onMatchSelected: (match: Match) => void }) {
    function isPlayerWinner(player: Player): boolean {
        if (!match.scores) {
            return false;
        }
        let score1 = match.scores.reduce((acc, set) => {
            return acc + set.score1!
        }, 0);
        let score2 = match.scores.reduce((acc, set) => {
            return acc + set.score2!
        }, 0);
        if (player.id === match.player1.id) {
            return score1 > score2;
        }
        if (player.id === match.player2.id) {
            return score2 > score1;
        }
        return false;
    }

    return (<div className={'card'}>
            <div className={`card-body ${styles.match}`}
                 onClick={() => editable && onMatchSelected(match)}
                 data-bs-toggle="modal"
                 data-bs-target="#exampleModal"
            >
                <div className={`${styles.tournamentMatch} ${styles.playersWrapper}`}>
                    <div
                        className={`${isPlayerWinner(match.player1) ? styles.playerWinner : ''}`}>
                        {match.player1.name}
                        {isPlayerWinner(match.player1) ? <FontAwesomeIcon icon={['fas', 'trophy']}/> : ''}
                    </div>
                    <div
                        className={`${isPlayerWinner(match.player2) ? styles.playerWinner : ''}`}>
                        {match.player2.name}
                        {isPlayerWinner(match.player2) ? <FontAwesomeIcon icon={['fas', 'trophy']}/> : ''}
                    </div>
                </div>

                <div className={`${styles.tournamentMatch} ${styles.matchResult}`}>
                    {match.scores && (
                        <>
                            {match.scores.map((score, index) => {
                                return <div key={index}
                                            style={{gap: '0.5em', display: 'flex', flexDirection: 'column'}}>
                                    <div
                                        className={`${isPlayerWinner(match.player1) ? styles.playerWinner : ''}`}>{score.score1}</div>
                                    <div
                                        className={`${isPlayerWinner(match.player2) ? styles.playerWinner : ''}`}>{score.score2}</div>
                                </div>
                            })
                            }
                        </>
                    )}
                    {!match.scores && editable && (
                        <div className={`btn btn-link ${styles.emptyScoreWrapper}`}
                        >
                            <FontAwesomeIcon icon={["fas", "edit"]}/>
                            V??sledok
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

function EditingMatch({
                          match,
                          scores,
                          onScoreChanged
                      }: { match: Match, scores: MatchSet[], onScoreChanged: (scores: MatchSet[]) => void }) {

    function scoreUpdated(value: string, setIndex: number, scoreProperty: 'score1' | 'score2') {
        if (value.startsWith('-') || value.includes('.') || value.includes(',')){
            return;
        }
        let newScores = [...scores];
        newScores[setIndex][scoreProperty] = value !== '' ? Number(value) : null;
        onScoreChanged(newScores);
    }

    function isNoneOrDefault(value: number | null): number | string{
        if (value === null || typeof value === 'undefined'){
            return '';
        }
        return value;
    }

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: 'repeat(2, fit-content(200px))',
            gridAutoRows: "auto",
            columnGap: '2em',
            rowGap: '1em',
            justifyContent: 'center',
            justifyItems: 'center',
            alignItems: 'center'
        }}>
            <div style={{fontWeight: 'bold'}}>{match.player1.name}</div>
            <div style={{fontWeight: 'bold'}}>{match.player2.name}</div>

            {match.scores.map((score, index) => {
                return <Fragment key={index}>
                    <input type="number" className="form-control" value={isNoneOrDefault(scores[index].score1!)}
                           onChange={(e) => scoreUpdated(e.target.value, index, 'score1')}
                           onKeyPress={(event) => {
                               if (!/[0-9]/.test(event.key)) {
                                   event.preventDefault();
                               }
                           }}
                    />

                    <input type="number" className="form-control" value={isNoneOrDefault(scores[index].score2!)}
                           onChange={(e) => scoreUpdated(e.target.value, index, 'score2')}
                           onKeyPress={(event) => {
                               if (!/[0-9]/.test(event.key)) {
                                   event.preventDefault();
                               }
                           }}
                    />
                </Fragment>
            })}
           {/*
           TODO kontumacia
            <button type="button" className="btn btn-danger"><FontAwesomeIcon icon={['fas', 'trophy']}/> Kontuma??n?? v??hra TODO</button>

            <button type="button" className="btn btn-danger"><FontAwesomeIcon icon={['fas', 'trophy']}/> Kontuma??n?? v??hra TODO</button>*/}

        </div>
    )
}
