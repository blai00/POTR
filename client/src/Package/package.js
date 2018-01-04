import React, { Component } from 'react';
import Axios from 'axios';
import './package.css';
import DisplayItems from './itemsListDisplay.js';
import Select from '../Admin/select.js';
import TestModal from "../Modal/testModal.js";

class Package extends Component{
    constructor(props){
        super(props);
        this.state = {
            packageName: '',
            packageDescription: '',
            category:'',
            categoryList:[],
            openingBid: '',
            increments:'',
            selectedItems: [],
            selectedNames: [],
            totalItems: 0,
            totalValue: 0
        }
    }

    //Input fields event handler
    onPackageChange = (e) => {
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
                  categoryList: response.data.categories
              })
            }
        }).catch((err)=>{
            console.log("categoryList failed", err)
        })
    }


    //function for adding a new category to the dropdown
    addingCategory = (value) =>{
        Axios({
            method: "post",
            url: "/api/categories",
            data: { category: value},
        }).then((response)=>{
            this.setState({
                categoryList: response.data
            })
        }).catch((err)=>{
            console.log(err);
        })
    }
    //Package form submit function
    onPackageFormSubmit = (e) => {
        e.preventDefault(); // prevents the default form behaviour
        Axios({
            method: 'post',
            url:'/api/packages',
            data:{packageName: this.state.packageName, packageDescription: this.state.packageDescription,
                  category: this.state.category, openingBid: this.state.openingBid, increments: this.state.increments,
                selectedItems:this.state.selectedItems, totalValue: this.state.totalValue}
            }).then((response) =>{
            if (response.data === false){
              alert("Package cannot be empty.")
            }
          else{
            this.setState({
                packageName: '',
                packageDescription: '',
                category:'',
                openingBid: '',
                increments:'',
                selectedItems: [],
                totalItems: 0,
                totalValue: 0

            })
            window.location.reload();
          }
            //reloading the page after the form has been submitted to show the remaining items that have not been added to a package


        }).catch((err)=>{
            console.log("Incomplete form submission" + err)
        })
    }

    //selecte items from the list and updating the display fields(totalItems and totalValue)
    capturingGroupedItems = (item, value, name) =>{   //callback function with two parameters -- item(is a number) and value(fair market value of the selected item)
        let itemSelect = this.state.selectedItems;
        itemSelect.push(item);
        let nameSelect = this.state.selectedNames;
        nameSelect.push(name);
        this.setState({
            selectedItems: itemSelect,
            selectedNames: nameSelect,
            totalItems: this.state.selectedItems.length,
            totalValue:  this.state.totalValue + value
        })
    }
     //unSelecte items from the list and updating the display fields(totalItems and totalValue)
    removeGroupedItems = (value, item) => {
        let itemUnselect = this.state.selectedItems;
        var nameUnselect = this.state.selectedNames;
        let id;
        for(var i=0; i<itemUnselect.length;i++){
            if(item === String(itemUnselect[i])){
                id = i;
                break;
            }
        }
        itemUnselect.splice(id,1)
        nameUnselect.splice(id,1)

        // console.log(itemUnselect)
        // console.log(nameUnselect)
        this.setState({
            selectedItems: itemUnselect,
            selectedNames: nameUnselect,
            totalItems: this.state.selectedItems.length,
            totalValue: this.state.totalValue - value
        })
    }

    render(){
        let items = this.state.selectedNames.map((item,index) =>{
            return <li key={index}>{item}</li>
        })

        return(
<div className="container"><div className="row">
            <div id='package-container' className='container-fluid'>

                <form className='form-inline' onSubmit={this.onPackageFormSubmit} id="packageInfo" >
                    <div className='package-info form-group col-sm-3 nopad' >
                        <h3>Package Info</h3>
                        <label  className="col-sm-2 col-form-label">Package Name</label><br/>
                        <input type='text' name='packageName' className='form-control' value={this.state.packageName} onChange={this.onPackageChange} placeholder='Package Name' required/><br/><br/>
                        <label className="col-sm-2 col-form-label">Package Description</label><br/>
                        <textarea name='packageDescription' className='form-control' value={this.state.packageDescription} rows='5'  onChange={this.onPackageChange} placeholder='Package Description'></textarea><br/><br/>
                        <label className="col-sm-2 col-form-label"> Category</label><br/>
                        <Select selectOptions={this.state.categoryList} name='category' className='form-control'
                                 value={this.state.category} handleChange={this.onPackageChange} required/><br/>

                        <TestModal addingCategory={this.addingCategory}/><br/><br/>
                        <label className="col-sm-2 col-form-label">Opening Bid</label><br/>
                        <input type='number' name='openingBid' className='form-control' value={this.state.openingBid} onChange={this.onPackageChange} min='0' placeholder='Opening Bid' required/><br/><br/>
                        <label className="col-sm-2 col-form-label">Increments</label><br/>
                        <input type='number' name='increments' className='form-control' value={this.state.increments} step='5' min='0' onChange={this.onPackageChange} placeholder='Increments' required/><br/><br/>
                        <label className="col-sm-2 col-form-label">Total Market value</label><br/>
                        <input className="form-control"  value={this.state.totalValue} placeholder="Total Items" readOnly /><br/><br/>
                        <label className="col-sm-2 col-form-label">Total Items</label><br/>
                        <input className="form-control" value={this.state.totalItems} placeholder="Total Items" readOnly /><br/><br/>
                        <input type='submit' value='Add New Package'className='btn btn-primary form-control'/>
                    </div>
                    <div className="form-group groupingItems col-sm-9 nopad">
                        <div className='item-select form'>
                            <h3>Grouping items</h3>
                            <div className='.table-responsive itemsList'>
                                    <DisplayItems
                                        selectedItems={this.state.selectedItems}
                                        capturingGroupedItems={this.capturingGroupedItems}
                                        removeGroupedItems={this.removeGroupedItems}/>
                            </div>
                        </div>

                        <div className="form displaySelectedItems">
                            <h3>This package has {this.state.selectedItems.length} items</h3>
                            {items}
                        </div>
                   </div>
               </form>
            </div>
</div></div>
        )
    }
}

export default Package;
