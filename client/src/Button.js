import React from 'react';
import './css/Button.css'

export default class Button extends React.Component {
    render(){
        const style = {
            background: this.props.disabled ? "#f1f1f9" : "#D6DAF0"
        }
        return (   
            <button className = "button" style = {style} onClick = {this.props.handler}>{this.props.text}</button>
        )
    }
}