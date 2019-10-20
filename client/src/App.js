import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import MainPage from './MainPage'

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      authenticated: false
    }
  }
  componentDidMount(){
    fetch("/api/isAuthenticated")
    .then(data => data.json())
    .then(authenticated => {
      if(!authenticated)
        window.location.href = "http://localhost:1337"
      else
        this.setState({authenticated: true});
    })
  }
  render() {
    return (
      (this.state.authenticated ? 
      <div style = {{animation: "fadeIn .3s"}}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component = {MainPage}></Route>
          </Switch>
        </BrowserRouter>
      </div>
      : <div>loading...</div>)
    )
  }
}

export default App;
