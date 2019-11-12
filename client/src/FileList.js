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
        this.state = {
            data: undefined,
            activeIndex: -1
        }
        this.last_click = 0;
    }
    componentDidMount(){
        this.update();
    }
    handleFileClick(event, element){
        console.log(this.last_click);
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
    }
    update(){
        window.addEventListener("click", () => {
            this.setState({activeIndex: -1})
        });
        fetch("/api/files")
        .then(data => data.json())
        .then(data => this.setState({data: data}));
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