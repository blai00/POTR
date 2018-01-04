import React, { Component } from 'react';
import './packageCatalog.css';

class SearchBar extends Component{

    handleChange = (e) =>{
        this.props.handleChange(e);
    }

    handleNewLetter = (e) =>{
        this.props.handleNewLetter(e);
    }

    render(){
        return(
                <div className='row'>
                    <div className='form-inline search-panel'>
                        <select className='form-control' onChange={this.handleChange} value={this.props.selectValue}>
                            <option value="All Categories">All Categories</option>
                            {this.props.categories}  
                        </select>
                        <input type='text' className='form-control' onChange={this.handleNewLetter} placeholder='KeywordSearch' />                            
                    </div>
                </div>

        )
    }
}

export default SearchBar;