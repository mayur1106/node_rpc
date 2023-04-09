const express = require('express');
const { RPCObserver, RPCRequest }  = require('./rpc');
const PORT = 9000;

const app = express();
app.use(express.json());

const fakeCustomerResponse = {
    _id:"asjasjh12212",
    name:"john Doe",
    country:'Poland'
}

RPCObserver("CUSTOMER_RPC",fakeCustomerResponse)

app.get('/wishlist',async (req,res)=>{
    const requestPayload = {
        productId:'123',
        customerId:'456',
    };
    try {
        const responseData = await RPCRequest("PRODUCT_RPC",requestPayload);
        console.log(responseData);
        return res.status(200).json(responseData)
    }catch(err){
        console.log(err)
        return res.status(500).json(err);
    }
})

app.get("/",(req,res)=>{
    return res.json("Customer Service");
})

app.listen(PORT,()=>{
    console.log("Server started on port "+PORT);
    console.clear();
})