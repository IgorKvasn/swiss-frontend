import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import {RecoilRoot, useRecoilState, useRecoilValue} from 'recoil';
import axios from "axios";
import {tournamentState} from './recoil/atoms';
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


axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;


ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <React.Suspense fallback={<div>Loading...</div>}>

                <BrowserRouter>
                    <NavigationBar/>
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
                Loading....
            </>
        );
    } else {
        return (
            <>
                Loaded
            </>
        );
    }
}

function NavigationBar() {
    const currentTournament = useRecoilValue(tournamentState);

    return (
        <div className="container">


          {/*  <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="#">Navbar</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item active">
                            <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Features</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Pricing</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link disabled" href="#">Disabled</a>
                        </li>
                    </ul>
                </div>
            </nav>*/}

            <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">SWISS</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNav"
                            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
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
                                        Háči a výsledky
                                    </NavLink>
                                </li>
                            </ul>
                        }
                    </div>
                </div>
            </nav>
        </div>
    )
}


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
