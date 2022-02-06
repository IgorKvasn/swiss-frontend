import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import {RecoilRoot, useRecoilValue} from 'recoil';
import axios from "axios";
import {tournamentState} from './recoil/atoms';
import {BrowserRouter, Route, Routes, useNavigate} from 'react-router-dom';
import {NewTournamentPage} from "./pages/NewTournamentPage";
import {ExistingTournamentPage} from './pages/ExistingTournamentPage';
import "./utils/font-awesome";


axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

console.log('aaa', process.env.REACT_APP_SERVER_URL);

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <React.Suspense fallback={<div>Loading...</div>}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Application/>}/>

                        <Route path="novy-turnaj" element={<NewTournamentPage />} />
                        <Route path="turnaj" element={<ExistingTournamentPage />} />
                    </Routes>
                </BrowserRouter>
            </React.Suspense>
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root')
);


function Application() {
    let navigate = useNavigate();

    const currentTournament = useRecoilValue(tournamentState);


    useEffect(() => {
        if (!currentTournament) {
            navigate("/novy-turnaj");
        } else {
            navigate("/turnaj");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            Loading....
        </>
    );
}


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
