import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import {RecoilRoot, useRecoilState} from 'recoil';
import axios from "axios";
import {tournamentState} from './recoil/atoms';
import {BrowserRouter, Route, Routes, useNavigate} from 'react-router-dom';
import {NewTournamentPage} from "./pages/NewTournamentPage";
import {ExistingTournamentPage} from './pages/ExistingTournamentPage';
import "./utils/font-awesome";
import "bootstrap/js/dist/modal"
import "bootstrap/js/dist/button"
import {generateTournamentId} from "./utils/tournament-utils";
import {AllRoundsPage} from "./pages/AllRoundsPage";


axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;


ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <React.Suspense fallback={<div>Loading...</div>}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Application/>}/>

                        <Route path="novy-turnaj" element={<NewTournamentPage/>}/>
                        <Route path="turnaj" element={<ExistingTournamentPage/>}/>
                        <Route path="vsetky-kola" element={<AllRoundsPage/>}/>
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


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
