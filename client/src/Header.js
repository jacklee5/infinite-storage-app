import React from 'react';
import './Header.css';
import logo from './new-year.png';

export default class Header extends React.Component {
    render(){
        return (
            <header class = "header">
                <img src = {logo} class = "logo"></img>
                <h1 class = "title">berd box</h1>
            </header>
        )
    }
}