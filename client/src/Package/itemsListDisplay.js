import React, {Component} from 'react';
import Axios from 'axios';

class DisplayItems extends Component{
    constructor(props){
        super(props);
        this.state = {
            itemsList : [],
            selectedItems: props.selectedItems,
            is_checked: true
        }
    }

    componentDidMount(){
        Axios.get("/api/items")
        .then((result) =>{
            let listOfItems = result.data.listOfItems;
            // console.log("listOfItems is an array", listOfItems);
            // let unpackaged_items = [];
            // for(var i = 0; i < listOfItems.length; i++){
            //     if(!listOfItems[i].packaged ){
            //         unpackaged_items.push(listOfItems[i])
            //     }
            //     // else if(result.data.listOfItems[i].packaged === true){
            //     //     console.log("Check for packaged", result.data.listOfItems[i].packaged)
            //     // }
            // }
            // console.log("ItemListDisplay", result.data)
            this.setState({
                itemsList: listOfItems
            })
        }).catch((err) =>{
            console.log(err);
        })

    }
    rowSelect= (e) =>{
        var object={};
        if(e.target.checked){
            for (var i = 0; i < this.state.itemsList.length; i++){
              if (e.target.name === String(this.state.itemsList[i]._id)){
                object = this.state.itemsList[i];
                break;
              }
            }
            this.props.capturingGroupedItems(object);
        }else{
            this.props.removeGroupedItems(parseInt((e.target.value),10), e.target.name)
        }
   }

   toggleCheckbox = () =>{
       this.setState({
            is_checked: !this.state.is_checked
       })
   }

    render(){
        //maping the array of objects into table data
        let items = this.state.itemsList.map((item,index) =>{
            // console.log("items packaged", item.packaged)
            if(item.packaged === true && this.props.packageId){
                return(
                    <tr key={index} >
                        <td><input type='checkbox' value={item.value} name={item._id} 
                            onChange={this.rowSelect} onClick={this.toggleCheckbox} checked={this.state.is_checked}/></td>
                        <td>{item._id}</td>
                        <td>{item.name}</td>
                        <td>{item.value}</td>
                        <td>{item.donor}</td>
                        <td>{item.description}</td>
                        <td>{item.restrictions}</td>
                    </tr>
                )
            }
            else if(!item.packaged){
                return(
                    <tr key={index} >
                        <td><input type='checkbox' value={item.value} name={item._id}  onChange={this.rowSelect} /></td>
                        <td>{item._id}</td>
                        <td>{item.name}</td>
                        <td>{item.value}</td>
                        <td>{item.donor}</td>
                        <td>{item.description}</td>
                        <td>{item.restrictions}</td>
                    </tr>
                )
            }
        })
        return(
           <div className='table-responsive table-container'>
                <table className='table table-striped table-bordered'>
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Item Number</th>
                            <th>Item Name</th>
                            <th>Fair Market Value</th>
                            <th>Donor</th>
                            <th>Item Description</th>
                            <th>Item Restriction</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default DisplayItems;
