import React from 'react';
import './css/Button.css'

export default class Button extends React.Component {
    render(){
        const style = {
            background: this.props.disabled ? "#BBDEFB" : "#2196F3"
        }
        return (   
            <button className = "button" style = {style} onClick = {this.props.handler}>{this.props.text}</button>
        )
    }
}