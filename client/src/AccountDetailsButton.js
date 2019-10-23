import React from 'react';
import './css/AccountDetailsButton.css';

export default class AccountDetailsButton extends React.Component {
    render() {
        return (
            <a href = {this.props.action} className = "account-details-button" onClick = {this.props.handler}>
                <i className = "material-icons">{this.props.icon}</i>
                <span>
                    {this.props.text}
                </span>
            </a>
        )
    }
}