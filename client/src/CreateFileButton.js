import React from 'react';
import UploadPopup from './UploadPopup';

export default class CreateFileButton extends React.Component {
    constructor(){
        super();
        //if upload true, upload button, if upload false, close button
        this.state = {
            upload: true,
            uploadPopupVisible: false
        }
        this.clickHandler = this.clickHandler.bind(this);
    }
    componentDidMount(){
        window.addEventListener("click", (e) => {
            if(!this.state.upload)
                this.setState({upload: true});
            this.setState({uploadPopupVisible: false})
        });
    }
    clickHandler(e){
        if(e)
            e.stopPropagation();
        this.setState({upload: !this.state.upload})
    }
    render(){
        console.log(this.state.uploadPopupVisible);
        const style = {
            transform: "rotate(" + (this.state.upload ? "0deg" : "405deg") + ")"
        }
        const topButtonStyle = {
            position: "fixed",
            right: "16px",
            bottom: (this.state.upload ? "28" : "178") + "px"
        }
        const bottomButtonStyle = {
            position: "fixed",
            right: "16px",
            bottom: (this.state.upload ? "28" : "106") + "px"
        }
        return (
            <div>
                {/* top button, create folder */}
                <div style = {topButtonStyle} className = "floating-action-button-sm" onClick = {(e) => {
                    this.clickHandler(e);
                    fetch("/api/createFolder").
                    then(x => this.props.update());
                }}>
                    <i className = "material-icons">
                        create_new_folder
                    </i>
                </div>
                {/* second top button, upload file */}
                <div style = {bottomButtonStyle} className = "floating-action-button-sm" onClick = {(e) => {
                    this.clickHandler(e);
                    this.setState({uploadPopupVisible: true});
                }}>
                    <i className = "material-icons">
                        cloud_upload
                    </i>
                    {
                        this.state.uploadPopupVisible ? <UploadPopup update = {this.update}></UploadPopup> : null
                    }
                </div>
                {/* button button, add file */}
                <div className = "floating-action-button-lg" onClick = {this.clickHandler}>
                    <i style = {style} className = "material-icons">add</i>
                </div>
            </div>
        )
    }
}