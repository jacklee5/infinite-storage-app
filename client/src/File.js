import React from 'react';
import './css/File.css';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

export default class File extends React.Component {

    render(){
        const style = this.props.active ? {background: "#BBDEFB"} : null;
        return (
            <div>
                <ContextMenuTrigger id = {this.props.data.id + "id"}>
                    <table style = {style} className = "file" onClick = {(e) => {this.props.handler(e, this)}}>
                        <tbody>
                            <tr>
                                <td style = {{width: "40%"}}>{this.props.data.name}</td>
                                <td style = {{width: "30%"}}>{this.props.data.date}</td>
                                <td style = {{width: "30%"}}>{this.props.data.type}</td>
                            </tr>
                        </tbody>
                    </table>
                </ContextMenuTrigger>
                <div className = "rightClickMenu">
                    <ContextMenu id = {this.props.data.id + "id"}>
                        <MenuItem onClick={(e) => {this.props.dlfile(e, this)}}>Download</MenuItem>
                        <MenuItem divider />
                        <MenuItem onClick={(e) => {this.props.delfile(e, this)}}>Delete</MenuItem>
                    </ContextMenu>
                </div>
            </div>
            
        )
    }
}