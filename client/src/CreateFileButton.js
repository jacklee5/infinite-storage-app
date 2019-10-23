import React from 'react';

export default class CreateFileButton extends React.Component {
    constructor(){
        super();
        //if upload true, upload button, if upload false, close button
        this.state = {
            upload: true
        }
        this.clickHandler = this.clickHandler.bind(this);
    }
    componentDidMount(){
        window.addEventListener("click", () => {
            if(!this.state.upload)
                this.setState({upload: true});
        })
    }
    clickHandler(e){
        if(e)
            e.stopPropagation();
        this.setState({upload: !this.state.upload})
    }
    render(){
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
                <div style = {topButtonStyle} className = "floating-action-button-sm" onClick = {() => {
                    this.clickHandler();
                    fetch("/api/createFolder").
                    then(x => this.props.update());
                }}>
                    <i className = "material-icons">
                        create_new_folder
                    </i>
                </div>
                {/* second top button, upload file */}
                <div style = {bottomButtonStyle} className = "floating-action-button-sm" onClick = {() => {
                    this.clickHandler();
                    fetch("/api/createFile")
                    .then(x => this.props.update());
                }}>
                    <i className = "material-icons">
                        cloud_upload
                    </i>
                </div>
                {/* button button, add file */}
                <div className = "floating-action-button-lg" onClick = {this.clickHandler}>
                    <i style = {style} className = "material-icons">add</i>
                </div>
            </div>
        )
    }
}