import React from 'react';
import './css/FileList.css';
import File from './File';
import CreateFileButton from './CreateFileButton';

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
        window.addEventListener("click", () => {
            this.setState({activeIndex: -1})
        });
        this.update();
    }
    handleFileClick(event, element){
        event.stopPropagation();
        this.setState({activeIndex: element.props.index});
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
                    ></File>)
                }) 
                : "loading files"}
            </div>
            <CreateFileButton update = {this.update}></CreateFileButton>
        </div>
        )
    }
}