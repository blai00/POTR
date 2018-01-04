import React, { Component } from 'react';
import './App.css';
import {BrowserRouter, Route} from 'react-router-dom';
//import {Route, Router, browserHistory} from 'react-router';
import Home from "./Welcome/home.js";
import Menu from './NavBar/menu.js';
import ItemEntryAdmin from './Admin/itemEntryAdmin.js';
import Catalog from './Catalog/catalog.js';
import Package from './Package/package.js';
import PackageCatalog from './PackagesCatalog/packageCatalog.js';
import LoginForm from './LoginReg/loginForm.js';
import RegForm from './LoginReg/regForm.js';
import PackageDetails from './PackagesCatalog/packageDetails.js';
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Menu />
          <Route exact path='/' component={Home}/>
          <Route path='/item/new' component={ItemEntryAdmin}/>
          <Route path='/items' component={Catalog}/>
          <Route path='/packages/new' component={Package}/>
          <Route path='/package' component={PackageCatalog}/>
          <Route path='/login' component={LoginForm}/>  
          <Route path='/register' component={RegForm}/>   
          <Route path='/packageDetails/:packageId' component={PackageDetails}/>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
