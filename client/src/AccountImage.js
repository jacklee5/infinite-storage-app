import React from 'react';
import './css/AccountImage.css';

export default class AccountImage extends React.Component {
    constructor(){
        super();
        this.state = {
            imageURL: ""
        }
    }
    componentDidMount(){
        fetch("/api/account-img")
        .then(data => data.json())
        .then(result => {
            console.log(result);
            this.setState({imageURL: result});
        });
    }
    render() {
        return (
            <img className = "account-img" src = {this.state.imageURL} onClick = {this.props.toggleAccountDetails}></img>
        )
    }
}