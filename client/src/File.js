import React from 'react';
import './css/File.css';

export default class File extends React.Component {

    render(){
        const style = this.props.active ? {background: "#BBDEFB"} : null;
        return (
        <table style = {style} className = "file" onClick = {(e) => {this.props.handler(e, this)}}>
            <tbody>
                <tr>
                    <td style = {{width: "40%"}}>{this.props.data.name}</td>
                    <td style = {{width: "30%"}}>{this.props.data.date}</td>
                    <td style = {{width: "30%"}}>{this.props.data.type}</td>
                </tr>
            </tbody>
        </table>
        )
    }
}