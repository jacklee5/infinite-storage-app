import React from 'react';
import './css/FileList.css';
import File from './File';
import CreateFileButton from './CreateFileButton';
import UploadPopup from './UploadPopup';

export default class FileList extends React.Component {
    constructor(){
        super();
        this.update = this.update.bind(this);
        this.handleFileClick = this.handleFileClick.bind(this);
        this.state = {
            data: undefined,
            activeIndex: -1
        }
    }
    componentDidMount(){
        this.update();
    }
    handleFileClick(event, element){
        event.stopPropagation();
        this.setState({activeIndex: element.props.index});
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
                    ></File>)
                }) 
                : "loading files"}
            </div>
            <CreateFileButton update = {this.update}></CreateFileButton>
            <UploadPopup update = {this.update}></UploadPopup>
        </div>
        )
    }
}