import React from 'react';
import './css/FileList.css';
import File from './File';
import CreateFileButton from './CreateFileButton';
import {withRouter} from 'react-router-dom'

import loadingImg from './piccypics/Loading.gif';
import sadImg from './piccypics/sad.png';

class FileList extends React.Component {
    constructor(props){
        super(props);
        this.update = this.update.bind(this);
        this.handleFileClick = this.handleFileClick.bind(this);
        this.dlfile = this.dlfile.bind(this);
        this.delfile = this.delfile.bind(this);
        this.keyHandler = this.keyHandler.bind(this);
        this.deselect = this.deselect.bind(this);
        this.state = {
            data: undefined,
            activeIndex: -1
        }
        this.last_click = 0;
        this.folderId = this.props.location.pathname.split("/")[2] || "";
        this.props.history.listen((location, action) => {
            this.folderId = location.pathname.split("/")[2] || "";
            this.setState({data: undefined})
            this.update();
        })
    }
    componentDidMount(){
        window.addEventListener("click", () => {
            this.setState({activeIndex: -1})
        });
        window.addEventListener("keydown", (e) => {
            this.keyHandler(e.keyCode);
        })
        this.update();
        this.props.history.listen((location, action) => {
            this.update();
        });
    }
    //Takes keyboard strokes and uses them as inputs for Berdbox
    keyHandler(keyCode){
        if(this.state.activeIndex === -1) return;
        const enter = 13;
        const up = 38;
        const down = 40;
        const del = 46;
        switch(keyCode) {
            //Enter does an action based on file type
            case enter:
                this.onFileSelect(this.state.data[this.state.activeIndex]);
                break;
            //Up goes up in the list
            case up:
                this.setState({activeIndex: (this.state.activeIndex - 1 + this.state.data.length) % this.state.data.length});
                break;
            //Down goes down in the list
            case down:
                this.setState({activeIndex: (this.state.activeIndex + 1) % this.state.data.length});
                break;
            //Del deletes a file
            case del:
                if(!this.state.data[this.state.activeIndex]) break;
                fetch("/api/delFile/" + this.state.data[this.state.activeIndex].id)
                .then(x => {
                    this.update();
                });
                this.setState({data: this.state.data.filter(x => {
                    return x.id !== this.state.data[this.state.activeIndex].id
                })});
                break;
        }
    }
    //If the file selected is a folder, it is opened. Otherwise, the file is downloaded
    onFileSelect(file){
        if(file.type === "folder"){
            this.props.history.push("/folder/" + file.id);
        } else{
            window.location.href = "http://localhost:1337/api/getFile/" + file.id;
        }
    }
    //Checks for a click. If double clicked, the file is downloaded
    handleFileClick(event, element){
        event.stopPropagation();
        this.setState({activeIndex: element.props.index});
        const type = element.props.data.type;
        const id = this.state.data[element.props.index].id
        if (Date.now() - this.last_click < 500) {
            this.onFileSelect(this.state.data[element.props.index]);
        }        
        this.last_click = Date.now();
    }
    //Downloads file
    dlfile(event, element) {
        event.stopPropagation();
        this.setState({activeIndex: element.props.index});
        window.location.href = "http://localhost:1337/api/getFile/" + this.state.data[element.props.index].id
    }
    //Deletes file. Also removes it from the files shown
    delfile(event, element) {
        event.stopPropagation();
        this.setState({activeIndex: element.props.index});
        this.setState({data: this.state.data.filter(x => {
            return x.id !== this.state.data[this.state.activeIndex].id
        })})
        fetch("/api/delFile/" + this.state.data[element.props.index].id)
        .then(x => {
            this.update();
        })
    }
    update(){
        fetch("/api/files/" + this.folderId)
        .then(data => data.json())
        .then(data => {
            const folders = [];
            const files = [];
            for(let i = 0; i < data.length; i++){
                if(data[i].type === "folder")
                    folders.push(data[i]);
                else   
                    files.push(data[i]);
            }
            const sorter = (a, b) => {
                if(a.name < b.name)
                    return -1;
                if(a.name > b.name)
                    return 1;
                else   
                    return 0;
            }
            folders.sort(sorter);
            files.sort(sorter);
            this.setState({data: [...folders, ...files]})
        });
    }
    deselect(){
        this.setState({activeIndex: -1});
    }
    render(){
        return (
        <div>
            <div className = "file-list">
                <table className = "file-list-header">
                    <tbody>
                        <tr>
                            <th style = {{width: "40%"}}>Name</th>
                            <th style = {{width: "30%"}}>Date</th>
                            <th style = {{width: "30%"}}>Type</th>
                        </tr>
                    </tbody>
                </table>
                <hr></hr>
                {this.state.data ?
                this.state.data.length !== 0 ?  
                this.state.data.map((x, i) => {
                    return (<File
                        data = {x}
                        handler = {this.handleFileClick}
                        key = {x.id}
                        index = {i}
                        active = {i === this.state.activeIndex}
                        dlfile = {this.dlfile}
                        delfile = {this.delfile}
                    ></File>)
                }) 
                : (<img src = {sadImg} style = {{width: "100px", height: "100px"}}></img>)
                : (<img src = {loadingImg} style = {{width: "100px", height: "100px"}}></img>)
                }
            </div>
            <CreateFileButton update = {this.update} deselect = {this.deselect}></CreateFileButton>
        </div>
        )
    }
}

export default withRouter(FileList);