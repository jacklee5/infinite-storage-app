import React from 'react';
import './css/Header.css';
import accountImg from './img/new-year.png';
import logo from './piccypics/BerdBoxLogo.png'
import AccountDetailsButton from './AccountDetailsButton';
import AccountImage from './AccountImage';
import AccountDetails from './AccountDetails';

export default class Header extends React.Component {
    constructor(){
        super();
        this.state = {
            accountDetailsVisible: false
        }
        this.toggleAccountDetails = this.toggleAccountDetails.bind(this);
    }
    componentDidMount(){
        window.addEventListener("click", () => {
            this.setState({accountDetailsVisible: false});
        })
    }
    toggleAccountDetails(e){
        e.stopPropagation();
        this.setState({
            accountDetailsVisible: !this.state.accountDetailsVisible
        });
    }
    render(){
        return (
            <header className = "header">
                <div className = "logo-container">
                    <img src = {logo} className = "logo"></img>
                    <h1 className = "title">berdbox</h1>
                </div>
                <AccountImage toggleAccountDetails = {this.toggleAccountDetails}></AccountImage>
                <AccountDetails  visible = {this.state.accountDetailsVisible}>
                    <AccountDetailsButton icon = "exit_to_app" text = "Sign out" action = "/logout"></AccountDetailsButton>
                </AccountDetails>
            </header>
        )
    }
}