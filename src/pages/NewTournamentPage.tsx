import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import axios from "axios";
import {useEffect, useRef, useState} from "react";
import styles from './NewTournament.module.scss';
import {useNavigate} from "react-router-dom";
import {TournamentSettings} from "../types/tournament-settings";
import {useRecoilState, useSetRecoilState} from "recoil";
import {Tournament} from "../types/tournament";
import {tournamentState} from "../recoil/atoms";

const ALL_PLAYERS_STORAGE_KEY = 'ALL_PLAYERS_STORAGE_KEY';
const TOURNAMENT_SETTINGS_STORAGE_KEY = 'TOURNAMENT_SETTINGS_STORAGE_KEY';

function readPlayersFromStorage(): string[] {
    let storage = window.localStorage.getItem(ALL_PLAYERS_STORAGE_KEY);
    if (!storage) {
        return [];
    }
    return JSON.parse(storage);
}

function readTournamentSettingsFromStorage(): TournamentSettings {
    let storage = window.localStorage.getItem(TOURNAMENT_SETTINGS_STORAGE_KEY);
    if (!storage) {
        return TOURNAMENT_SETTINGS_DEFAULT;
    }
    return JSON.parse(storage);
}

const TOURNAMENT_SETTINGS_DEFAULT = {maxSets: 2, byeMatchResult: '7/6'} as TournamentSettings;

export function NewTournamentPage() {
    const setCurrentTournamentState = useSetRecoilState(tournamentState);
    const [newPlayer, setNewPlayer] = useState('');
    const [tournamentSettings, setTournamentSettings] = useState<TournamentSettings>(readTournamentSettingsFromStorage());
    const [allPlayers, setAllPlayers] = useState<string[]>(readPlayersFromStorage());
    let navigate = useNavigate();
    const newPlayerInputElement = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let playersString = JSON.stringify(allPlayers ?? []);
        window.localStorage.setItem(ALL_PLAYERS_STORAGE_KEY, playersString!);
    }, [allPlayers]);

    useEffect(() => {
        let tournamentSettingsString = JSON.stringify(tournamentSettings ?? TOURNAMENT_SETTINGS_DEFAULT);
        window.localStorage.setItem(TOURNAMENT_SETTINGS_STORAGE_KEY, tournamentSettingsString!);
    }, [tournamentSettings])

    function onAddPlayer() {
        setAllPlayers([...allPlayers, newPlayer]);
        setNewPlayer('');
        newPlayerInputElement.current!.focus();
    }

    function onRemovePlayer(i: number) {
        let newPlayers = allPlayers.filter((p, index)=>{return i!==index});
        setAllPlayers(newPlayers);
    }

    function changePlayerName(newName: string, index: number){
        let newArr = [...allPlayers];
        newArr[index] = newName;
        setAllPlayers(newArr);
    }

    function onTournamentStart(){
        let data = {
            names: allPlayers,
            tournamentSettings
        };
        axios.post('tournaments/', data).then((response)=>{
            window.localStorage.removeItem(ALL_PLAYERS_STORAGE_KEY);
            window.localStorage.removeItem(TOURNAMENT_SETTINGS_STORAGE_KEY);
            setCurrentTournamentState(response.data as Tournament);
            navigate('/');
        }).catch((e)=>{
            alert('Nepodarilo sa vytvoriť turnaj!');
            console.error(e);
        })
    }

    return <div className="container-sm">
        <div className="card mb-2">
            <div className="card-header">Nastavenia turnaja</div>
            <div className="card-body">

                <div className="mb-3">
                    <label htmlFor="maxSets" className="form-label">Maximálny počet setov</label>
                    <input type="number" className="form-control" id="maxSets"
                           value={tournamentSettings.maxSets}
                           onChange={(e)=>setTournamentSettings({...tournamentSettings, maxSets: Number(e.target.value)})}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="byeMatchResult" className="form-label">Výsledok v prípade BYE</label>
                    <input type="string" className="form-control" id="byeMatchResult"
                           value={tournamentSettings.byeMatchResult}
                           onChange={(e)=>setTournamentSettings({...tournamentSettings, byeMatchResult: e.target.value})}
                    />
                </div>
            </div>
        </div>

        <div className="card mb-3">
            <div className="card-header">Hráči</div>
            <div className="card-body">
                <div className={styles.playersList}>

                    {allPlayers.map((p, index)=>{
                        return <div key={index} className={`${styles.newPlayerInputWrapper} mb-3`}>
                            <span className={styles.playerOrder}>{index + 1}.</span>
                            <input type="text" className="form-control" placeholder="Meno" value={p}
                                   onChange={(e) => changePlayerName(e.target.value, index)}/>
                            <button type="button" className="btn btn-danger" onClick={() => onRemovePlayer(index)}>
                                <FontAwesomeIcon icon={["fas", "user-minus"]}/>
                                Odobrať
                            </button>
                        </div>
                    })}

                <div className={`${styles.newPlayerInputWrapper} mb-3`}>
                    <input type="text" className="form-control" placeholder="Meno" value={newPlayer}
                           onChange={(e) => setNewPlayer(e.target.value)}
                           ref={newPlayerInputElement}
                           onKeyUp={(e)=>{if (e.key === 'Enter'){onAddPlayer()}}}
                    />
                    <button type="button" className="btn btn-primary" onClick={() => onAddPlayer()}>
                        <FontAwesomeIcon icon={["fas", "user-plus"]}/>
                        Pridať
                    </button>
                </div>
                </div>
            </div>
        </div>

        <button className={'btn btn-primary mb-5'} onClick={onTournamentStart}>
            <FontAwesomeIcon icon={['fas', 'running']}/>
            Vytvoriť turnaj a spustiť</button>
    </div>
}
