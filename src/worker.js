import React from 'react';
import axios from 'axios';
import Blob from 'blob-the-builder';
import uuid from 'uuid';
import FormData from 'form-data';

export default class Card extends React.Component {

    isClicked = false;

    render() {
        return (
            <React.Fragment>
                <div className="container-fluid">
                    <label className="text-center text-dark" style={{ width: '100%', fontSize: '25px'}}>PRESS THE BUTTON TO START THE PROCESS</label>
                    <br></br>
                    <button onClick={this.doJob} className="btn btn-primary">ISSUE IDENTITY</button>
                    <br></br>
                    <br></br>
                    <label className="text-center text-dark" style={{ width: '100%', fontSize: '15px'}}>Response will be shown on your browser network stack.</label> 
                </div>
            </React.Fragment>
        )
    }

    doJob = () => {
        const _uuid = uuid();
        
        axios.post('http://YOUR_IP/api/AddCarrier', {
            "$class": "org.shipping.bitnautic.AddCarrier",
            "addCarrier": {
            "$class": "org.shipping.bitnautic.Carrier",
            "website": "string",
            "address": "string",
            "location": "string",
            "port": "string",
            "name": "string",
            "email": _uuid,
            "country": "string",
            "phone": "string",
            "city": "string",
            "state": "string",
            "postalCode": "string",
            "photo": "string",
            "walletAddress": "string",
            "identityAddress": "string"
            }
        }).then(res => {
            this.agentTransaction = String(res['data'].transactionId);
            console.log(this.agentTransaction)
            axios.get('http://YOUR_IP/jwt/login').then(_res => {

                const key = _res.data['access_token'];
                
                axios.post('http://YOUR_IP/api/system/identities/issue', {
                    "participant": `org.shipping.bitnautic.Carrier#${_uuid}`,
                    "userID": _uuid
                }, {headers: { 'Content-Type': 'application/json' , 'Accept': 'application/octet-stream'}, observe: 'response', responseType: 'arraybuffer' }).then(response => {
                    const certificate = new Blob([response['data']]);
                    
                    const form = new FormData();
                    form.append('card',  certificate);
                    axios.post(`http://YOUR_IP/api/wallet/import?name=identity&access_token=${key}`, form, {observe: 'response'})
                    .then(data => { 
                    }).catch(e=>{console.log(e)})
                })

            })
        })
    }

}