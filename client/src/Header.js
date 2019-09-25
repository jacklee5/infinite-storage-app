import React from 'react';
import './css/Header.css';
import logo from './img/new-year.png';
import AccountDetailsButton from './AccountDetailsButton';

export default class Header extends React.Component {
    render(){
        return (
            <header className = "header">
                <div className = "logo-container">
                    <img src = {logo} className = "logo"></img>
                    <h1 className = "title">berdbox</h1>
                </div>
                <div className = "account-button-container">
                    <img src = {logo} className = "account-img"></img>
                    <div className = "account-details">
                        <AccountDetailsButton icon = "exit_to_app" text = "Sign out"></AccountDetailsButton>
                    </div>
                </div>
            </header>
        )
    }
}