import React from 'react';
import './register.css';
import Axios from 'axios';
import {Link} from 'react-router-dom';
import { Redirect } from 'react-router';

class RegForm extends React.Component{
    constructor (props){
        super(props);
        this.state={
            firstName:'',
            lastName:'',
            streetAddress:'',
            city:'',
            states:'',
            zip:'',
            phoneNumber:'',
            email:'',
            userName:'',
            password:'',
            cnfmPassword:'',
            redirect: false
        };
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name] : e.target.value
        })
    }

    formSubmit = (e) =>{
        e.preventDefault(); // prevent default form submission behaviour

        //Sree, please add prompt asking for user to insert matching passwords if the below condition is met

        if (this.state.password !== this.state.cnfmPassword) {
          alert("Passwords do not match. Please try again.")
          return;
        }

        Axios({
            method: "post",
            url: "/api/users",
            data: {
                  firstName: this.state.firstName,
                  lastName:this.state.lastName,
                  streetAddress:this.state.streetAddress,
                  city:this.state.city,
                  states:this.state.states,
                  zip:this.state.zip,
                  phoneNumber:this.state.phoneNumber,
                  email:this.state.email,
                  userName: this.state.userName,
                  password: this.state.password,
                   },

        }).then((response) => {
            if(response.data.validated) {
              this.setState({
                      firstName:'',
                      lastName:'',
                      streetAddress:'',
                      city:'',
                      states:'',
                      zip:'',
                      phoneNumber:'',
                      email:'',
                      userName:'',
                      password:'',
                      cnfmPassword:'',
                      redirect: true
              })

              // window.location.href ="/package"
              localStorage.setItem('user',response.data.user.userName);
            };
            alert(response.data.message);


        }).catch((err) =>{
            console.log(err);
        })
    }

    render(){

      // Redirect
      var redirect  = this.state.redirect;
      if (redirect) {
        return <Redirect to='/package'/>;
      }

        return(
            <div className='container'>
                <div className='well registration-form'>
                 <h2> Register</h2>
                 <form onSubmit={this.formSubmit} >
                    <div className="form-group row">
                      <label  className="col-sm-2 col-form-label">First Name</label>
                      <div className="col-sm-10">
                        <input type='text' id='firstName' className='form-control' name='firstName'
                        placeholder='First Name' onChange={this.handleChange} value={this.state.firstName} required/>
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Last Name</label>
                      <div className="col-sm-10">
                        <input type='text' id='lastName' className='form-control' name='lastName'
                        placeholder='Last Name' onChange={this.handleChange} value={this.state.lastName} required/>
                      </div>
                    </div>

                    <div className="form-group row">
                            <label className="col-sm-2 col-form-label">Street Address</label>
                            <div className="col-sm-10">
                              <input type='text' id='streetAddress' className='form-control' name='streetAddress'
                              placeholder='Street Address' onChange={this.handleChange} value={this.state.streetAddress} required/>
                            </div>
                    </div>

                    <div className="form-group row">
                            <label className="col-sm-2 col-form-label">City</label>
                            <div className="col-sm-10">
                              <input type='text' id='city' className='form-control' name='city'
                              placeholder='City' onChange={this.handleChange} value={this.state.city} required/>
                            </div>
                    </div>

                    <div className="form-group row">
                            <label className="col-sm-2 col-form-label">State</label>
                            <div className="col-sm-10">
                              <input type='text' id='states' className='form-control' name='states'
                              placeholder='State' onChange={this.handleChange} value={this.state.states} required/>
                            </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Zip Code</label>
                      <div className="col-sm-10">
                        <input type='number' id='zip' className='form-control' name='zip' min='5'
                        placeholder='Ex: 94050' onChange={this.handleChange} value={this.state.zip} required/>
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Phone Number</label>
                      <div className="col-sm-10">
                        <input type='tel' id='phoneNumber' className='form-control' name='phoneNumber'
                        placeholder='Ex: 4084044080' onChange={this.handleChange} value={this.state.phoneNumber} />
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Email Address</label>
                      <div className="col-sm-10">
                        <input type='email' id='email' className='form-control' name='email'
                        placeholder='Ex:example@gmail.com' onChange={this.handleChange} value={this.state.email} required/>
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">User Name</label>
                      <div className="col-sm-10">
                        <input type='text' id='userName' className='form-control' name='userName'
                        placeholder='User Name' onChange={this.handleChange} value={this.state.userName} required/>
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Password</label>
                      <div className="col-sm-10">
                        <input type='password' id='password' className='form-control' name='password'
                        placeholder='Password' onChange={this.handleChange} value={this.state.password} required/>
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Confirm Password</label>
                      <div className="col-sm-10">
                        <input type='password' id='cnfmPassword' className='form-control' name='cnfmPassword'
                        placeholder='Confirm Password' onChange={this.handleChange} value={this.state.cnfmPassword} required/>
                      </div>
                    </div>

                    <div className="form-group row">
                     <input type='submit' id='submit' value='Submit' className='btn btn-primary ' />
                    </div>

                    <p>Already registered? Go to Login! </p>

                    </form>
                       <p><Link to='/'>Login</Link></p>
                </div>
            </div>
        )
    }

}

export default RegForm;
