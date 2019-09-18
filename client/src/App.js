import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import MainPage from './MainPage'

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component = {MainPage}></Route>
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App;
