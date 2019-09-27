import React from 'react';
import './css/AccountDetails.css';

export default class AccountDetails extends React.Component {
    render(){
        const style = {};
        if(this.props.visible){
            style.display = "block";
        }else{
            style.display = "none";
        }
        return (
            <div className = "account-details" style = {style}>{this.props.children}</div>
        )
    }
}