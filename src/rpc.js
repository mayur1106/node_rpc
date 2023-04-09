const amqplib = require("amqplib");
const {v4:uuid4} = require("uuid");

let amqplibConnection = null;

const getChannel = async ()=>{
    if(amqplibConnection == null){
        amqplibConnection = await amqplib.connect("amqp://localhost");
    }

    return amqplibConnection.createChannel(); 
}


const expensiveDBOperation = async (payload,fakeResponse) =>{

    console.log(payload);
    console.log(fakeResponse);

    return new Promise((res,rej)=>{
        setTimeout(()=>{
            res(fakeResponse);
        },15000)
    })
}

const RPCObserver = async (RPC_QUEUE_NAME,fakeResponse) =>{
    const channel = await getChannel();
    await channel.assertQueue(RPC_QUEUE_NAME,{
        durable:true
    });

    channel.prefetch(1);
    channel.consume(
        RPC_QUEUE_NAME,
        async (msg)=>{
            if(msg.content){
                const payload = JSON.parse(msg.content.toString());
                const response = await  expensiveDBOperation(fakeResponse,payload);
                channel.sendToQueue( 
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(response)),
                    {
                        correlationId: msg.properties.correlationId
                    }
                );
                channel.ack(msg);
            }
        },
        {
            noAck:false
        }
    )

}

const requestData =async(RPC_QUEUE_NAME,payload,uuid) =>{
    const channel = await getChannel();

    const  q = await channel.assertQueue("",{exclusive:true}); // If some response come to here then only it will be able to receive data 

    channel.sendToQueue(RPC_QUEUE_NAME,Buffer.from(JSON.stringify(payload)),{
        replyTo:q.queue,
        correlationId:uuid,
    });

    return new Promise((resolve,reject)=>{
        // timeout 

        const timeOut  = setTimeout(()=>{
            channel.close();
            resolve("API could not fulfill the API Request");
        },8000);
        channel.consume(q.queue,(msg)=>{
            if(msg.properties.correlationId == uuid){
                resolve(JSON.parse(msg.content.toString()))
                clearTimeout(timeOut);
            } else {
                reject("Data not found");
            }
          
        },{
            noAck:true,
        });
    });
}

const RPCRequest = async (RPC_QUEUE_NAME,requestPayload) =>{

    const uuid = uuid4(); //corelation Id 

    return await requestData(RPC_QUEUE_NAME,requestPayload,uuid)
}

module.exports ={
    getChannel,RPCObserver,RPCRequest
} 