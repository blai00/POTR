import React, { Component } from 'react';
import Axios from 'axios';
import './packageDetails.css';
import {Link} from 'react-router-dom';

  // socket import
  import openSocket from 'socket.io-client';

  if (process.env.NODE_ENV === "production") {
    // for DEPLOYMENT;
    var host = "http://" + window.location.hostname;
  } else {
    // for LOCAL;
    var host = "http://localhost:8000";
  }
  const socket = openSocket(host);

  // subscribe to bids from server
  function subscribeToBids(cb, packId ) {
    var uniqChatUpdateId = 'update_chat' + packId;
    // receiving data from server on "update Chat"
    socket.on(uniqChatUpdateId, (bidsUpdate) => cb(null, bidsUpdate));
    // sending event to refresh bids
    socket.emit('page_refresh', {pId: packId });
  }

  // make a bid
  function makeABid(cb, objectWithdata) {
    // sending event to refresh bids
    socket.emit('msg_sent', objectWithdata);
  }

  var socket_updated = false;


class PackageDetails extends Component{
    constructor(props){
        super(props);
        this.state = {
            packageId: this.props.match.params.packageId,
            listOfPackages: '',
            place_bid: '',
            // our sockets default value
            bidsUpdate: {
              lastBid:"...",
              userBidLast: "..",
              socket_current_bid: false
            }
        }
        // function to update sockets
        subscribeToBids((err, bidsUpdate) => this.setState({
          bidsUpdate
        }), this.state.packageId ); // {this.state.bidsUpdate}
    }

    componentDidMount(){
        var packIdId = this.props.match.params.packageId;
        Axios.get("/api/packages/" + packIdId)
        .then((result) =>{
            console.log(result)
            this.setState({
                  listOfPackages: result.data.packages
            })
        }).catch((err) =>{
            console.log(err);
        })
        // We are always listening to dedicated for this package channel for
        // emitted by server messegase with te same uniq name
        // step 1: generating uniq channel name
        //var packIdId = this.props.match.params.packageId;
        var packIdchannel = 'update_chat' + packIdId;
        var self = this;
        socket_updated = false;
        // step 2: making sockets to listening to this channel
        socket.on(packIdchannel,function(data){
          self.updateStateAfterBidding();
        })
    }

    updateStateAfterBidding = () =>{
      socket_updated = true;
    }

    updatePlaceBid = (lastBid, bidIncrement) =>{
        this.setState({
            place_bid: lastBid + bidIncrement
        })
    }
    placeBidSubmit = () =>{
        Axios({
          method: "get",
          url: "/api/users/loggedin",
          data: {}
      }).then((response) => {
          console.log(response.data)
          if (!response.data.login_check){
            alert("Please login to Bid");
            window.location.href ="/login" ;
          }else{
              var pack_id = this.state.packageId;
              var bid = this.state.place_bid;
              makeABid((err, bidsUpdate) => this.setState({
          bidsUpdate
        }),{
          bid: this.state.place_bid,
          packId: this.state.packageId,
          userName: localStorage.user
        });
          }
      }).catch((err) =>{
          console.log(err);
      })
    }

    render(){
        // console.log(this.state.listOfPackages)
        // trying to find the index of the (show)package from the array
        //traversing the target package(which is JSON object)
        let packagedata = this.state.listOfPackages;
        let x = [];
        let packageName = '', packageDescription='', packageValue = '',packageItems=[], starting_bid="", bids = [], bid_increment='';

        for(var key in packagedata){
            x.push(packagedata[key]);
            // console.log(x[3]);
            if(key === "name"){
                packageName = packagedata[key];
            }else if(key === "description"){
                packageDescription = packagedata[key];
            }else if(key === 'value'){
                packageValue = packagedata[key];
                if (packageValue === 0){
                  packageValue = "Priceless"
                }
            }else if( key === '_items'){
                packageItems = packagedata[key];
                console.log(packageItems)
            }else if( key === 'amount'){
                starting_bid = packagedata[key];
            }else if( key === 'bids'){
                bids = packagedata[key];
            }else if( key === 'bid_increment'){
                bid_increment = packagedata[key];
            }
        }
        //listing the items in the package
        let itemsInPackage = packageItems.map((item, index)=>{
            return(
                <div key={index}>
                    <li>{item.name} - {item.description} - by <span className='donor-info'>{ item.donor}</span></li>
                    <p>Item Restriction - {item.restrictions}</p>
                </div>
            )
        })
        //current_bid
        let current_bid = starting_bid;
        if (bids.length !== 0){
          current_bid = bids[bids.length - 1].bidAmount
        }
        //Place bid

        //Discovered this is a timing issue: current bid is not defined when this "render" function takes place, so it can't look inside of it; however, the function works when you don't look inside of it, because it is null and then changes to the object on render
        if(socket_updated && typeof this.state.bidsUpdate.lastBid === 'number'){
          this.state.place_bid = parseInt((this.state.bidsUpdate.lastBid),10) + bid_increment;
            // this.updatePlaceBid(lastBid, bid_increment)
        } else {
          this.state.place_bid = current_bid + bid_increment;
            //  this.updatePlaceBid(current_bid, bid_increment);
        }

        //conditional rendering
        if(this.state.listOfPackages){
        return(

            <div className="container">
                <div className="row">
                    <div className='container-fluid bidContainer'>
                    <div className='bids'></div>
                        <div className='row'>
                            <div className='imgNtitle  pull-left col-xs-12 col-sm-6 col-md-3'>
                                <img src='/no-image.png' alt={packageName} className='img-thumbnail col-xs-12'/>
                            </div>
                            <div className='bidDetails col-xs-12 col-sm-6 col-md-9'>
                                <h1 className='text-uppercase packageName'> {packageName} </h1>
                                <div className="hline"></div>
                                    <table className="packIntro">
                                        <tr>
                                        <td>Package Value:</td>
                                        <td><b>{packageValue}</b></td>
                                        </tr>
                                        <tr>
                                        <td>Starting Bid:</td>
                                        <td><b>${starting_bid}</b></td>
                                        </tr>
                                    </table>

                                    <div className='bidSection'>
                                    <table className="packIntro">
                                        <tr className="curBid">
                                            <td>Current Bid:</td>
                                            <td><b >${this.state.bidsUpdate.lastBid} </b>
                                            (by <span>{this.state.bidsUpdate.userBidLast}</span>)
                                            </td>
                                        </tr>
                                        <tr className="curBid">
                                            <td>Next Bid:</td>
                                            <td>
                                                <input className='bidInput' type='text' name='' value={this.state.place_bid} readOnly />
                                                <button className='placeBid btn-primary' type='submit'  value='' onClick={this.placeBidSubmit}>Place bid</button>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div className='packageDescription'>
                                    <h4>Description: </h4>
                                    <p className="packdescription">{packageDescription}</p>
                                    <h5>Items in package: </h5>
                                    <p className="packdescription">{itemsInPackage}</p>

                                </div>
                                <Link to='/package'>Back to All Packages</Link>
                            </div>
                        </div>
                    </div>
        </div></div>
        )}
        else{
            return(
                <h3>Loading....</h3>
            )
        }

    }
}

export default PackageDetails;
