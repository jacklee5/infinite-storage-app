import React from 'react';
import './css/File.css';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import img from './piccypics/Picture.png'
import mov from './piccypics/Movie.gif'
import oth from './piccypics/Folder.png'

export default class File extends React.Component {

    constructor(){
        super();
        this.choosePicture = this.choosePicture.bind(this);
    }
    
    choosePicture(check) {
        const images = ["jpg", "jpeg", "tiff", "gif", "bmp", "png", "svg", "pdn", "sai", "psd", "ai"];
        const videos = ["webm", "avi", "mov", "mp4", "m4v", "3gp", "flv", "swf"];
        if (images.indexOf(check.toLowerCase()) !== -1) {
            return img;
        } else if (videos.indexOf(check.toLowerCase()) !== -1) {
            return mov;
        } else {
            return oth;
        }
    }

    render(){
        const style = this.props.active ? {background: "#BBDEFB"} : null;
        return (
            <div>
                <ContextMenuTrigger id = {this.props.data.id + "id"}>
                    <table style = {style} className = "file" onClick = {(e) => {this.props.handler(e, this)}}>
                        <tbody>
                            <tr>
                                <td style = {{width: "40%"}}><img src={this.choosePicture(this.props.data.type)}align = "left" style={{width: "100%", height: "30px", maxWidth: "30px", maxHeight: "30px", marginRight: "8px"}}></img>{this.props.data.name}</td>
                                <td style = {{width: "30%"}}>{this.props.data.date}</td>
                                <td style = {{width: "30%"}}>{this.props.data.type}</td>

                            </tr>
                        </tbody>
                    </table>
                </ContextMenuTrigger>
                <div className = "rightClickMenu">
                    <ContextMenu id = {this.props.data.id + "id"}>
                        <MenuItem onClick={(e) => {this.props.dlfile(e, this)}}>Download</MenuItem>
                        <MenuItem onClick={(e) => {this.props.delfile(e, this)}}>Delete</MenuItem>
                    </ContextMenu>
                </div>
            </div>
            
        )
    }
}