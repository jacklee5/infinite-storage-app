import React from 'react';
import Button from './Button';
import {withRouter} from 'react-router-dom';

class FolderPopup extends React.Component {
    constructor(){
        super();
        this.state = {
            canSubmit: false
        }
        this.clickHandler = this.clickHandler.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
    }
    clickHandler(e){
        e.preventDefault();
        e.stopPropagation();
        if(!this.state.canSubmit) return;

        const data = new URLSearchParams();
        for (const pair of new FormData(document.getElementById("folder-form"))) {
            data.append(pair[0], pair[1]);
        }
        fetch("/api/createFolder/" + this.props.location.pathname.split("/")[2] || "", {
            method: 'post',
            body: data,
        })
        .then(x => this.props.update())

        this.props.hide();
    }
    changeHandler(e){
        const el = e.target;
        if(el.value.length > 0)
            this.setState({canSubmit:true})
        else   
            this.setState({canSubmit:false})
    }
    render() {
        return (
            <form className = "popup" action="/api/createFolder" method="post" onClick = {(e) => e.stopPropagation()} id = "folder-form" onSubmit = {this.clickHandler}>
                <h1>Create a folder</h1>
                <input type="text" id="folder-name" onChange = {this.changeHandler} name = "title"></input>
                <br></br><br></br>
                <Button disabled = {!this.state.canSubmit} text = "upload" style = {{width: "100%"}} handler = {this.clickHandler}></Button>
            </form >
        )
    }
}

export default withRouter(FolderPopup)