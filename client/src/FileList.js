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
        })
        const data = [{
            fileName: "gay persons are ga1y",
            date: "10/2/2019",
            type: "IMG",
            size: "10.6GB",
            id: "lsadjfk"
        },
        {
            fileName: "gay persons are2 gay",
            date: "10/2/2019",
            type: "IMG",
            size: "10.6GB",
            id: "lswyadjfk"
        },
        {
            fileName: "gay persons 3are gay",
            date: "10/2/2019",
            type: "IMG",
            size: "10.6GB",
            id: "df"
        },
        {
            fileName: "gay persons 4are gay",
            date: "10/2/2019",
            type: "IMG",
            size: "10.6GB",
            id: "as"
        }];
        this.setState({data: data})
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
                        <th style = {{width: "40%"}}>File Name</th>
                        <th style = {{width: "25%"}}>Date</th>
                        <th style = {{width: "16%"}}>Type</th>
                        <th style = {{width: "16%"}}>Size</th>
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
            : "loading"}
        </div>
        )
    }
}