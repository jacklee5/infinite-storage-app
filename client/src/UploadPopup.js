import React from 'react';
import Button from './Button';

export default class UploadPopup extends React.Component {
    constructor(){
        super();
        this.state = {
            canSubmit: false
        }
        this.fileChangeHandler = this.fileChangeHandler.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
    }
    clickHandler(e){
        e.preventDefault();
        e.stopPropagation();
        if(!this.state.canSubmit) return;
        const el = document.getElementById("fileUpload");
        for(let i = 0; i < el.files.length; i++){
            const file = el.files[i];
            const formData = new FormData();
            formData.append("file", file);
            fetch('/api/uploadFile', {method: "POST", body: formData})
            .then(x => this.props.update())
        }
        this.props.hide();
    }
    fileChangeHandler(e){
        const el = e.target;
        if(el.files.length > 0)
            this.setState({canSubmit: true})
        else   
            this.setState({canSubmit: false})
    }
    render() {
        return (
            <form className = "popup" encType="multipart/form-data" action="/api/createFile" method="post" onClick = {(e) => e.stopPropagation()}>
                <h1>Upload a file</h1>
                <input type="file" id="fileUpload" multiple size="50" onChange={this.fileChangeHandler}></input>
                <br></br><br></br>
                <Button disabled = {!this.state.canSubmit} text = "upload" style = {{width: "100%"}} handler = {this.clickHandler}></Button>
            </form >
        )
    }
}