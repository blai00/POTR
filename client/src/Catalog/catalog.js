import React, { Component } from 'react';
import "./catalog.css";
import Axios from 'axios';

class Catalog extends Component{
    constructor(props){
        super(props);
        this.state = {listOfItems: []}
    }

    componentDidMount(){
        Axios.get("/items")
        .then((result) =>{
            console.log(result);
            this.setState({
                listOfItems: result.data
            })
        }).catch((err) =>{
            console.log(err);
        })
    }
    render(){
        let itemsList = this.state.listOfItems.map((item,index) =>{
            return(
                <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                    <td>{item.description}</td>
                    <td>{item.restrictions}</td>
                    <td>{item._package}</td>
                </tr>
            )
        })
        return(
            <div className='table-responsive table-container'>
                <table className='table table-striped table-bordered'>
                    <thead>
                        <tr>
                            <th>Item Number</th>
                            <th>Item Name</th>
                            <th>Fair Market Value</th>
                            <th>Item Description</th>
                            <th>Item Restriction</th>
                            <th>Package</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsList}                        
                    </tbody>
                </table>
            </div>
        )
    }
}

export default Catalog;