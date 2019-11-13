import React from 'react';
import './css/FileList.css';
import File from './File';
import CreateFileButton from './CreateFileButton';

export default class FileList extends React.Component {
    constructor(){
        super();
        this.update = this.update.bind(this);
        this.handleFileClick = this.handleFileClick.bind(this);
        this.dlfile = this.dlfile.bind(this);
        this.delfile = this.delfile.bind(this);
        this.keyHandler = this.keyHandler.bind(this);
        this.state = {
            data: undefined,
            activeIndex: -1
        }
        this.last_click = 0;
    }
    componentDidMount(){
        window.addEventListener("click", () => {
            this.setState({activeIndex: -1})
        });
        window.addEventListener("keydown", (e) => {
            this.keyHandler(e.keyCode);
        })
        this.update();
    }
    keyHandler(keyCode){
        const enter = 13;
        const up = 38;
        const down = 40;
        const del = 46;
        switch(keyCode) {
            case enter:
                window.location.href = "http://localhost:1337/api/getFile/" + this.state.data[this.state.activeIndex].id;
                break;
            case up:
                this.setState({activeIndex: (this.state.activeIndex - 1 + this.state.data.length) % this.state.data.length});
                break;
            case down:
                this.setState({activeIndex: (this.state.activeIndex + 1) % this.state.data.length});
                break;
            case del:
                fetch("/api/delFile/" + this.state.data[this.state.activeIndex].id)
                .then(x => {
                    this.update();
                })
                break;
        }
    }
    handleFileClick(event, element){
        event.stopPropagation();
        this.setState({activeIndex: element.props.index});
        if (Date.now() - this.last_click < 500) {
            ///api/getFile/3
            window.location.href = "http://localhost:1337/api/getFile/" + this.state.data[element.props.index].id
        }
        this.last_click = Date.now();
    }
    dlfile(event, element) {
        event.stopPropagation();
        this.setState({activeIndex: element.props.index});
        window.location.href = "http://localhost:1337/api/getFile/" + this.state.data[element.props.index].id
    }
    delfile(event, element) {
        event.stopPropagation();
        this.setState({activeIndex: element.props.index});
        fetch("/api/delFile/" + this.state.data[element.props.index].id)
        .then(x => {
            this.update();
        })
    }
    update(){
        console.log("yo")
        fetch("/api/files")
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
                : "loading files"}
            </div>
            <CreateFileButton update = {this.update}></CreateFileButton>
        </div>
        )
    }
}