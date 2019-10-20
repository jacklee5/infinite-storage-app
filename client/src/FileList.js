import React from 'react';
import './css/FileList.css';
import File from './File';

export default class FileList extends React.Component {
    constructor(){
        super();
        this.handleFileClick = this.handleFileClick.bind(this);
        this.state = {
            data: [],
            activeIndex: -1
        }
    }
    componentDidMount(){
        window.addEventListener("click", () => {
            this.setState({activeIndex: -1})
        });
        fetch("/api/files")
        .then(data => data.json())
        .then(data => this.setState({data: data}));
    }
    handleFileClick(event, element){
        event.stopPropagation();
        this.setState({activeIndex: element.props.index});
    }
    render(){
        return (
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
        )
    }
}