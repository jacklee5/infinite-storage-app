import React from 'react';
import './css/AccountDetailsButton.css';

export default class AccountDetailsButton extends React.Component {
    render() {
        return (
            <a href = "/logout" class = "account-details-button">
                <i class = "material-icons">{this.props.icon}</i>
            </a>
        )
    }
}