import React, { Component } from 'react';
import "./itemEntryAdmin.css";
import Axios from 'axios';
import Select from './select.js'
import TestModal from "../Modal/testModal.js";

class ItemEntryAdmin extends Component{
    constructor(props){
        super(props);
        this.state = {
                itemName: '',
                donor: '',
                category: [],
                fairMarketValue: '',
                itemDescription: '',
                itemRestriction: '',
                selectOptions: []
        }

    }

    //callback function for capturing user input changes
    handleChange = (e) => {
        this.setState({
            [e.target.name] : e.target.value
        })
    }

    componentDidMount(){
        //Get request for category dropdown list
        Axios.get("/api/categories")
        .then((response)=>{
            if (!response.data.admin){
              window.location = "/"
            }
            else{
              this.setState({
                  selectOptions: response.data.categories
              })
            }
        }).catch((err)=>{
            console.log("categoryList failed", err)
        })
    }

    addingCategory = (value) =>{
       Axios({
           method: "post",
           url: "/api/categories",
           data: { category: value},
       }).then((response)=>{
           this.setState({
               selectOptions: response.data
           })
       }).catch((err)=>{
           console.log(err);
       })
   }

//posting data to the database on form submission
    formSubmit = (e) =>{
        e.preventDefault(); // prevent default form submission behaviour
        Axios({
            method: "post",
            url:"/api/items",
            data:{itemName: this.state.itemName, donor: this.state.donor, category: this.state.category,
                  fairMarketValue: this.state.fairMarketValue, itemDescription: this.state.itemDescription,
                itemRestriction: this.state.itemRestriction},
        }).then((response) => {
            this.setState({
                itemName: '',
                donor: '',
                category:'',
                fairMarketValue:'',
                itemDescription: '',
                itemRestriction: ''
            })
        }).catch((err) =>{
            console.log("Incomplete Form", err);
        })
    }

    render(){
        return(
<div className="container"><div className="row">
            <div className='container row'>
                <label><h2>Item Info</h2> </label>
                <div className='item-info'>
                    <form  onSubmit={this.formSubmit}>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">Item Name</label>
                            <div className="col-sm-10">
                                <input className='form-control' id='itemName' type='text' name='itemName'
                                       placeholder='Item Name' onChange={this.handleChange} value={this.state.itemName} required/><br/>
                            </div>
                         </div>
                         <div className="form-group row">
                            <label className="col-sm-2 col-form-label">Donor Name</label>
                            <div className="col-sm-10">
                                <input className='form-control' type='text' name='donor' id='donorName'
                                        placeholder='Donor' onChange={this.handleChange} value={this.state.donor} required/><br/>
                            </div>
                         </div>
                        {/*Select component renders the dropdown for category selection*/}
                         <div className="form-group row">
                            <label className="col-sm-2 col-form-label">Category</label>
                            <div className="col-sm-10">
                                <Select name='category' handleChange={this.handleChange} selectOptions={this.state.selectOptions}/><br/>
                            </div>
                         </div>
                        {/*TestModal component renders the modal for adding new category option to the dropdown*/}
                         <div className="form-group row">
                            <label className="col-sm-2 col-form-label"></label>
                            <div className="col-sm-10">
                                <TestModal addingCategory={this.addingCategory} /><br/>
                            </div>
                         </div>
                         <div className="form-group row">
                            <label className="col-sm-2 col-form-label">Fair Market Value</label>
                            <div className="col-sm-10 input-group">
                                <div className="input-group-addon">$</div>
                                    <input type="number" name='fairMarketValue' id="fairMarketValue" className="form-control" placeholder="Fair Market Value"
                                            value={this.state.fairMarketValue} onChange={this.handleChange} min='0' required />

                                <div className="input-group-addon">.00</div>
                            </div><br/>
                         </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label">Item Description</label>
                            <div className="col-sm-10">
                                <textarea name='itemDescription' className="form-control" rows='5' id="description"
                                          placeholder='Item Description' value={this.state.itemDescription} onChange={this.handleChange} required></textarea><br/>

                            </div>
                         </div>
                         <div className="form-group row">
                            <label className="col-sm-2 col-form-label">Item Restriction</label>
                            <div className="col-sm-10">
                                <textarea name='itemRestriction' className="form-control" rows='4' id='itemRestriction'
                                          placeholder='Item Restrcition' value={this.state.itemRestriction} onChange={this.handleChange}></textarea><br/>
                            </div>
                         </div>
                         <div className="form-group row">
                            <input type='submit' className='btn btn-primary' value='Add' />
                        </div>
                    </form>
                </div>

            </div>
</div></div>
        )
    }
}

export default ItemEntryAdmin;
