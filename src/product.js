const express = require('express');
const { RPCObserver,RPCRequest }  = require('./rpc');

const PORT = 9001;

const app = express();
app.use(express.json());
const fakeProductResponse = {
    _id:"asjasjh12212",
    title:"iphone",
    price:'2500'
}

RPCObserver("PRODUCT_RPC",fakeProductResponse)

app.get('/customer',async (req,res)=>{
    const requestPayload = {
        customerId:'456',
    };
    try {
        const responseData = await RPCRequest("CUSTOMER_RPC",requestPayload);
        console.log(responseData);
        return res.status(200).json(responseData)
    }catch(err){
        console.log(err)
        return res.status(500).json(err);
    }
   
})

app.get("/",(req,res)=>{
    return res.json("Products Service");
})

app.listen(PORT,()=>{
    console.log("Server started on port "+PORT);
    console.clear();

})