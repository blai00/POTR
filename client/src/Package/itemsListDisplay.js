import React, {Component} from 'react';
import Axios from 'axios';
import EditPackage from './editPackage.js';

class DisplayItems extends Component{
    constructor(props){
        super(props);
        this.state = {
            itemsList : [],
            selectedItems: this.props.selectedItems,
            editPageSelected: {}
            // is_checked: true
        }
    }

    componentDidMount(){

      // console.log("this.state")
      // console.log(this.state)

        Axios.get("/api/items")
        .then((result) =>{
            let listOfItems = result.data.listOfItems;
            // console.log("itemsListDisplay.js -- listOfItems is an array", listOfItems);
            let unpackaged_items = [];
            for(var i = 0; i < listOfItems.length; i++){
                if(!listOfItems[i].packaged ){
                    unpackaged_items.push(listOfItems[i])
                }
                // else if(result.data.listOfItems[i].packaged === true){
                //     console.log("Check for packaged", result.data.listOfItems[i].packaged)
                // }
            }
            console.log("ItemListDisplay.js --> result.data ", result.data)
            this.setState({
                itemsList: listOfItems
            })

            // CREATING LIST OF SELECTED ITEMS IF IT IS EDIT ACTION
            this.state.itemsList.map((item,index) =>{
                if(item._package == this.props.packageId){
                  this.state.editPageSelected[item._id];
                  this.state.editPageSelected[item._id]={}
                }
            });

            console.log("----> this.state.itemsList <-----")
            console.log(this.state.itemsList)

        }).catch((err) =>{
            console.log(err);
        })


    }
    rowSelect= (e) =>{
        // var object={};
        console.log("itemsListDisplay.js --  checked check", e.target.checked, e.target.name);

        if(e.target.checked){
            console.log(" ------------> SOMETHING WAS SELECTED <--------------");
            console.log("check if", e.target.name);
            for (var i = 0; i < this.state.itemsList.length; i++){
              if (e.target.name === String(this.state.itemsList[i]._id)){
                  // console.log("package-id",  this.state.itemsList[i]._id);
                // object = this.state.itemsList[i];
                this.props.capturingGroupedItems(this.state.itemsList[i]);

                if(this.state.editPageSelected[e.target.name] != undefined){
                  this.state.editPageSelected[e.target.name];
                  this.state.editPageSelected[e.target.name] = {}
                }
                break;
              }
            }

        }else{
            console.log(" ------------> SOMETHING WAS UN____SELECTED <--------------");
            console.log("check else", e.target.name);
            this.props.removeGroupedItems(parseInt((e.target.value),10), e.target.name);
            delete this.state.editPageSelected[e.target.name];
        }
        console.log("==== this.props ====")
        console.log(this.props)
   }

//    toggleCheckbox = (e) =>{
//        console.log("Checkbox", e.target.name);
//        let checked = false;
//     //    this.setState({
//     //         is_checked: !e.target.checked
//     //    })
//     return checked;
//    }

    render(){
        //maping the array of objects into table data
            // map old stuff
            var items = this.state.itemsList.map((item,index) =>{

                      // don't put value={item.value} in first if statement - it won't work, it puts it byitself somehow?... it just works fine now
                      if(window.location.href.indexOf("edit") > 0 &&
                      this.state.editPageSelected[item._id] != undefined){
                        return(
                          <tr key={index} >
                          <td><input type='checkbox'  name={item._id}
                          onChange={this.rowSelect} defaultChecked='true'/></td>
                          <td>{item._id}</td>
                          <td>{item.name}</td>
                          <td>{item.value}</td>
                          <td>{item.donor}</td>
                          <td>{item.description}</td>
                          <td>{item.restrictions}</td>
                          </tr>
                        )
                      }
                      if(
                          // all unpackaged items
                          !item.packaged ||
                          // all items which are already belonged to current package
                          (
                            (+this.props.packageId === +item._package) &&
                            !this.state.editPageSelected[item._id] &&
                            !!item.packaged
                          )
                      ){
                            return(
                              <tr key={index} >
                              <td><input type='checkbox' value={item.value} name={item._id}  onChange={this.rowSelect}  /></td>
                              <td>{item._id}</td>
                              <td>{item.name}</td>
                              <td>{item.value}</td>
                              <td>{item.donor}</td>
                              <td>{item.description}</td>
                              <td>{item.restrictions}</td>
                              </tr>
                            )
                      }


              });






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
