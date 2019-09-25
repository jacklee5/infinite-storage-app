import React from 'react';
import './css/Header.css';
import logo from './img/new-year.png';

export default class Header extends React.Component {
    render(){
        return (
            <header className = "header">
                <div className = "logo-container">
                    <img src = {logo} className = "logo"></img>
                    <h1 className = "title">berdbox</h1>
                </div>
                <div className = "account-button-container">
                    <img src = {logo}></img>
                </div>
            </header>
        )
    }
}