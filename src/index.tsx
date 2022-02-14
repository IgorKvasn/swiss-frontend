import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import {RecoilRoot, useRecoilState} from 'recoil';
import axios from "axios";
import {newTournamentState, tournamentState} from './recoil/atoms';
import {BrowserRouter, NavLink, Route, Routes, useNavigate} from 'react-router-dom';
import {NewTournamentPage} from "./pages/NewTournamentPage";
import {ExistingTournamentPage} from './pages/ExistingTournamentPage';
import "./utils/font-awesome";

import "bootstrap/js/dist/modal"
import "bootstrap/js/dist/button"
import 'bootstrap/js/dist/collapse';


import {generateTournamentId} from "./utils/tournament-utils";
import {AllRoundsPage} from "./pages/AllRoundsPage";
import {PlayersPage} from './pages/PlayersPage';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Loading} from "./components/Loading";
import {Tournament} from "./types/tournament";


axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

const TOURNAMENT_CHECKER_INTERVAL = 5 * 60 * 1000;

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <React.Suspense fallback={<div>Načítavam...</div>}>

                <BrowserRouter>
                    <NavigationBar/>
                    <HttpLoadingIndicator/>
                    <DeleteTournamentButton/>
                    <Routes>
                        <Route path="/" element={<Application/>}/>

                        <Route path="novy-turnaj" element={<NewTournamentPage/>}/>
                        <Route path="turnaj" element={<ExistingTournamentPage/>}/>
                        <Route path="vsetky-kola" element={<AllRoundsPage/>}/>
                        <Route path="hraci" element={<PlayersPage/>}/>
                    </Routes>
                </BrowserRouter>
            </React.Suspense>
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root')
);


function Application() {
    let navigate = useNavigate();

    const [, setCurrentTournament] = useRecoilState(tournamentState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetch() {
            try {
                const response = await axios.get(`/tournaments/${generateTournamentId()}?newRound=false`);
                if (!response.data.rounds) {
                    //this means that data recived from server are invalid - e.g. server is not running...
                    navigate("/novy-turnaj");
                    return null;
                }
                setCurrentTournament(response.data);
                navigate("/turnaj");
            } catch (error) {
                navigate("/novy-turnaj");
                return null;
            } finally {
                setLoading(false);
            }
        }

        setLoading(true);
        fetch()
    }, []);

    if (loading) {
        return (
            <>
                <Loading/>
            </>
        );
    } else {
        return (
            <>
                <Loading/>
            </>
        );
    }
}

function NavigationBar() {
    const [currentTournament, setCurrentTournament] = useRecoilState(tournamentState);
    const [newTournament, setNewTournament] = useRecoilState(newTournamentState);
    const checkerInterval = useRef<number | null>(null);

    useEffect(() => {
        if (!currentTournament) {
            if (checkerInterval.current) {
                clearInterval(checkerInterval.current);
                checkerInterval.current = null;
            }
            return;
        }
        let interval = setInterval(() => {
            axios.get(`/tournaments/${generateTournamentId()}?newRound=false`, {
                params: {tournamentUpdateChecker: true}
            }).then((response) => {
                let newDate = response.data as Tournament;
                if (JSON.stringify(currentTournament) !== JSON.stringify(newDate)) {
                    setNewTournament(newDate);
                }
            });

        }, TOURNAMENT_CHECKER_INTERVAL);
        // @ts-ignore
        checkerInterval.current = interval;

        return () => {
            checkerInterval.current = null;
            clearInterval(interval);
        }
    }, [currentTournament]);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
            <div className="container">
                <a className="navbar-brand" style={{marginRight: '3em'}} href="/">
                    <AppLogo/>
                    <span style={{marginLeft: '10px'}}>SWISS</span></a>

                <div className="collapse navbar-collapse" id="navbarNav">
                    {currentTournament &&

                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                                         to="/turnaj">Aktuálne kolo</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                                         to="/vsetky-kola">
                                    <FontAwesomeIcon icon={["fas", "chart-line"]}/>{' '}
                                    Všetky kolá
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                                         to="/hraci">
                                    <FontAwesomeIcon icon={["fas", "users"]}/> {' '}
                                    Hráči a výsledky
                                </NavLink>
                            </li>

                        </ul>

                    }
                </div>
                <div className="nav-item d-flex flex-row justify-content-end">
                    {newTournament && (
                        <button className={'btn btn-link text-success'}
                                style={{paddingLeft: 0}}
                                onClick={() => {
                                    setCurrentTournament(newTournament);
                                    setNewTournament(null);
                                }
                                }>
                            <FontAwesomeIcon icon={["fas", "rotate"]}/> Aktualizovať turnaj
                        </button>
                    )}
                </div>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
    )
}

function AppLogo() {
    return (

        <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
             viewBox="0 0 56 56" width="36px" height="36px">
            <path style={{fill: "#D3EF30"}} d="M7.062,27.616c0.228,5.148,2.462,9.679,6.296,12.763c3.979,3.201,9.2,4.521,14.318,3.617
    c3.038-0.535,6.062-2.102,8.743-4.53c1.628-1.475,3.111-3.121,4.408-4.891c3.796-5.178,4.756-11.798,2.505-17.277
    c-2.603-6.334-8.319-10.295-15.3-10.603c-4.898,0.316-9.002-0.945-11.856-3.663c-0.096-0.092-0.168-0.199-0.219-0.313
    C10.348,5.394,5.775,9.884,2.984,15.427c0.101,0.049,0.2,0.107,0.283,0.192C6.077,18.479,7.39,22.626,7.062,27.616z"/>
            <path style={{fill: "#D3EF30"}} d="M28,0c-3.558,0-6.958,0.671-10.089,1.881c2.436,2.115,5.892,3.092,10.043,2.814l0.055-0.004
    l0.054,0.002c7.807,0.323,14.207,4.751,17.12,11.844c2.514,6.119,1.464,13.483-2.741,19.22c-1.377,1.878-2.951,3.625-4.679,5.191
    c-2.961,2.682-6.329,4.417-9.738,5.018c-1.173,0.207-2.351,0.308-3.52,0.308c-4.503,0-8.885-1.508-12.4-4.336
    C7.802,38.476,5.301,33.4,5.062,27.646l-0.002-0.055l0.003-0.055c0.289-4.251-0.741-7.761-2.954-10.205C0.753,20.62,0,24.221,0,28
    c0,15.464,12.536,28,28,28s28-12.536,28-28C56,12.536,43.464,0,28,0z"/>
            <path style={{fill: "#FFFFFF"}} d="M5.063,27.536l-0.003,0.055l0.002,0.055c0.238,5.754,2.739,10.83,7.042,14.292
    c3.516,2.828,7.897,4.336,12.4,4.336c1.169,0,2.347-0.102,3.52-0.308c3.409-0.601,6.777-2.335,9.738-5.018
    c1.728-1.566,3.302-3.313,4.679-5.191c4.205-5.737,5.255-13.101,2.741-19.22C42.27,9.444,35.869,5.017,28.062,4.693l-0.054-0.002
    l-0.055,0.004c-4.151,0.279-7.607-0.699-10.043-2.814c-0.663,0.256-1.316,0.532-1.954,0.837c0.052,0.114,0.123,0.222,0.219,0.313
    c2.854,2.718,6.958,3.979,11.856,3.663c6.98,0.308,12.697,4.269,15.3,10.603c2.251,5.479,1.291,12.099-2.505,17.277
    c-1.297,1.771-2.78,3.416-4.408,4.891c-2.682,2.429-5.705,3.995-8.743,4.53c-5.118,0.903-10.34-0.416-14.318-3.617
    c-3.834-3.084-6.068-7.615-6.296-12.763c0.327-4.989-0.985-9.137-3.796-11.997c-0.083-0.085-0.182-0.143-0.283-0.192
    c-0.313,0.622-0.607,1.257-0.874,1.904C4.323,19.776,5.352,23.285,5.063,27.536z"/>


        </svg>

    );
}

function HttpLoadingIndicator() {

    const [reqLoading, setReqLoading] = useState(false);
    const [show, setShow] = useState(false);

    useEffect(() => {
        let timer: number | null = null;
        if (reqLoading === true) {
            // @ts-ignore
            timer = setTimeout(() => {
                setShow(true);
            }, 200);
        } else {
            if (timer !== null) {
                clearTimeout(timer);
            }
            setShow(false);
        }
        return () => {
            if (timer !== null) {
                clearTimeout(timer);
            }
            setShow(false);
        }
    }, [reqLoading]);

    // Add a request interceptor
    axios.interceptors.request.use(function (config) {
        // Do something before request is sent
        if (config.params?.tournamentUpdateChecker !== true) {
            setReqLoading(true);
        }
        return config;
    }, function (error) {
        // Do something with request error
        setReqLoading(false);
        return Promise.reject(error);
    });

// Add a response interceptor
    axios.interceptors.response.use(function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        setReqLoading(false);
        return response;
    }, function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        setReqLoading(false);
        return Promise.reject(error);
    });

    return (
        <>
            {show && (
                <div style={{
                    position: 'fixed',
                    inset: '0',
                    backgroundColor: 'hsl(0deg 0% 0% / 58%)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 1
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '25em',
                        height: '4em',
                        zIndex: '1',
                        backgroundColor: 'white',
                        border: '1px solid black',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <AppLogo/> Komunikujem so serverom, prosím čakajte...
                    </div>
                </div>)}
        </>
    );
}

function DeleteTournamentButton() {

    const [pass, setPass] = useState('');
    const navigate = useNavigate();
    const [currentTournament, setCurrentTournament] = useRecoilState(tournamentState);

    function onConfirmDelete() {
        if (pass.length === 0) {
            return;
        }
        let tournamentId = generateTournamentId();
        axios.delete(`tornaments/${tournamentId}/${pass}`).then(() => {
            setCurrentTournament(null);
            navigate('/');
        });
        setPass('');
    }

    return (
        <>
            {currentTournament && <>
                <button className={'btn btn-outline-danger'}
                        style={{position: "fixed", bottom: 0, right: 0, borderColor: 'transparent'}}
                        data-bs-toggle="modal"
                        data-bs-target="#deleteTournamentDialog"
                >
                    <FontAwesomeIcon icon={['fas', 'trash-can']} style={{marginRight: 0}}/>
                </button>

                <div className="modal fade" id="deleteTournamentDialog" tabIndex={-1}
                     aria-labelledby="deleteTournamentDialogLabel"

                     aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-danger" id="deleteTournamentDialogLabel">Naozaj chcete
                                    zrušiť tento turnaj?</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"
                                        aria-label="Close"></button>
                            </div>
                            <div className="modal-body">

                                <div className="mb-3">
                                    <label htmlFor="deletePassword" className="form-label">Zadajte heslo:</label>
                                    <input type="password"
                                           className="form-control"
                                           id="deletePassword"
                                           value={pass}
                                           onChange={(e) => setPass(e.target.value)}/>
                                </div>

                            </div>
                            <div className="modal-footer">

                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                                        onClick={() => {
                                            setPass('');
                                        }}
                                >Nie, nezrušiť turnaj
                                </button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal"
                                        onClick={() => onConfirmDelete()}>Áno, naozaj chcem zrušiť turnaj
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>}
        </>
    )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
