import React from 'react';
import Header from './Header';
import FileList from './FileList';

export default class MainPage extends React.Component {
    render(){
        return (
            <div>
                <Header></Header>
                <FileList></FileList>
            </div>
        )
    }
}