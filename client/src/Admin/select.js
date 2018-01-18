import React, { Component } from 'react';

class Select extends Component{
    
    handleChange = (e) => {
        this.props.handleChange(e); //invoke the parent(itemEntryAdmin.js) callback for handling the changes
    }

    render(){
        //maping the array with option tags
        let dropdownOptions = this.props.selectOptions.map((itemValue,index) => {
            return <option key={index} value={itemValue.name} >{itemValue.name}</option>
        })
        let optionValue = this.props.optionValue === undefined?'Select a category ': this.props.optionValue;
        // console.log("optionValue:", optionValue);
        return(
            <div>
                <select className='form-control' onChange={this.handleChange} name={this.props.name} >
                    <option>{optionValue}</option>
                    {dropdownOptions}
                </select>
            </div>
        )
    }
}

export default Select;