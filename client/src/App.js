import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import MainPage from './MainPage'

class App extends React.Component {
  render() {
    return (
      <div style = {{animation: "fadeIn .3s"}}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component = {MainPage}></Route>
          </Switch>
        </BrowserRouter>
      </div>
    )
  }
}

export default App;
