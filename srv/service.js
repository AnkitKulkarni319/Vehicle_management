const cds=require('@sap/cds')

module.exports=cds.service.impl(async function()
{
    const {State,Dealer,Customer,Order,Vehicle}=this.entities;


    this.before('CREATE',State,async(req)=>{
        const {State_ID,State_Name}=req.data;

        if(!State_Name || !State_ID)
        {
            return req.reject(`Fields should have inputs`);
        }
        if (State_ID.length !=2) {
        return req.reject('State_ID must be 2 characters only');
    }
        const exists=await SELECT.one.from(State).where({State_ID});
        if (exists) {
        return req.reject('State is already exists');
    }
    })


    this.on('CREATE', State, async (req) => {
    const data = req.data;
    await INSERT.into(State).entries(data);

    const result = await SELECT.one.from(State).where({ State_ID: data.State_ID });
    return result;

});

this.on('READ',State,async(req)=>{
   const {State_ID}=req.data;
   if(State_ID)
   {
    return SELECT.from(State).where({State_ID});
   }
   else
   {
    return SELECT.from(State);
   }
})


    this.on('UPDATE', State, async (req) => {
        //console.log(req.data);
    const { State_ID, State_Name } = req.data;

    if (!State_ID || !State_Name) {
        req.error('Fields required for update');
    }

    const state = await SELECT.one.from(State).where({ State_ID });
        if(!state)
        {
            req.error('state is not present');
        }
        //console.log(req.error);
        
    await UPDATE(State).set({ State_Name }).where({ State_ID });

       const updated = await SELECT.one.from(State).where({ State_ID });
    return updated;

});

this.on('DELETE', State, async (req) => {

    const { State_ID } = req.data;
    const state = await SELECT.one.from(State).where({ State_ID });

    if (!state) {
        req.reject('State not found');
    }

    const result=await DELETE.from(State).where({ State_ID });
return result;

});



this.on('READ','StateID',async(req)=>{
    const state= await SELECT.from(State).columns(['State_ID']);
    if(!state)
    {
        req.reject('state not present');
    }
    return state;
})



//DEALERS

this.before('CREATE',Dealer,async(req)=>{
    const {Dealer_ID,Dealer_Name,Location,state_State_ID}=req.data;
if(!Dealer_ID || !Dealer_Name || !Location || !state_State_ID)
    {
        req.reject('Fields should not be empty');
    }
const stateExists = await SELECT.one.from(State).where({ State_ID: state_State_ID });
if (!stateExists) {
    return req.reject(`State  does not exist`);
}
    const Exists=await SELECT.one.from(Dealer).where({Dealer_ID});
    if(Exists)
    {
        req.reject('Already Dealer exists for some state')
    }
})

this.on('CREATE',Dealer,async(req)=>{
    const data=req.data;
    await INSERT.into(Dealer).entries(data);
    const result=SELECT.from(Dealer).where({Dealer_ID:data.Dealer_ID})
    return result;
})


this.on('READ',Dealer,async(req)=>{
   const {Dealer_ID}=req.data;
   if(Dealer_ID)
   {
    return SELECT.from(Dealer).where({Dealer_ID});
   }
   else
   {
    return SELECT.from(Dealer);
   }
})


this.on('UPDATE',Dealer,async(req)=>{
     //const {Dealer_ID,Location}=req.data;
const {Dealer_ID}=req.params[0];
const {Location}=req.data;
    if (!Dealer_ID || !Location) {
        req.reject('Fields required for update');
    }

const dealer = await SELECT.one.from(Dealer).where({ Dealer_ID });
        if(!dealer)
        {
            req.error('dealer is not present');
        }
    await UPDATE(Dealer).set({ Location }).where({ Dealer_ID });
       const updated = await SELECT.one.from(Dealer).where({ Dealer_ID });
    return updated;
})

this.on('DELETE', Dealer, async (req) => {
    const { Dealer_ID } = req.params[0];
    
    const dealer = await SELECT.one.from(Dealer).where({ Dealer_ID });

    if (!dealer) {
        req.reject('State not found');
    }

    const result=await DELETE.from(Dealer)
        .where({ Dealer_ID });

    return result;

});


//VEHICLES

this.before('CREATE', 'Vehicle', async (req) => {

    const { Model, Price_New, dealer_Dealer_ID, state_State_ID } = req.data;

    if (!Model || !Price_New) 
return req.reject('Model and Price_New are required');
    if (Price_New < 50000) 
            return req.reject('Price should be greater than 50000');
    if (!dealer_Dealer_ID) 
return req.reject('Dealer must be provided');
    if (!state_State_ID) 
    return req.reject('State must be provided');

    
    const stateExists = await SELECT.one.from(State).where({ State_ID: state_State_ID });
    if (!stateExists) 
return req.reject(`State does not exist`);


    const dealer = await SELECT.one.from(Dealer).where({ Dealer_ID: dealer_Dealer_ID, state_State_ID });
    if (!dealer) 
return req.reject(`Dealer does not belong to added State`);

   
    const lastVehicle = await SELECT.one.from('Vehicle').where({ state_State_ID }).orderBy('Vehicle_ID desc');

    let newNumber = 1;  
    if (lastVehicle && lastVehicle.Vehicle_ID) {
        const numericPart = lastVehicle.Vehicle_ID.slice(state_State_ID.length);
        newNumber = parseInt(numericPart) + 1;  
    }

    req.data.Vehicle_ID = state_State_ID + newNumber.toString().padStart(4, '0');

    
    const existingVehicle = await SELECT.one.from('Vehicle').where({ Vehicle_ID: req.data.Vehicle_ID });
    if (existingVehicle) 
return req.reject(`Vehicle_ID already exists`);

   
    req.data.Price_Old = 0;
});

this.on('Create','Vehicle',async(req)=>{
    const data=req.data;
    await INSERT.into('Vehicle').entries(data);
    const result=SELECT.from('Vehicle').where({Vehicle_ID:data.Vehicle_ID})
    return result;
})


this.on('READ',Vehicle,async(req)=>{
  const {Vehicle_ID}=req.data;
    if(Vehicle_ID)
    {
        return SELECT.from(Vehicle).where({Vehicle_ID});
    }
    else
    {
        return SELECT.from(Vehicle);
    }
})



 this.on('UPDATE', 'Vehicle', async (req) => {

        const {Vehicle_ID} = req.params[0];
        const { Price_New } = req.data;

        if (!Vehicle_ID) req.error('Vehicle_ID is required');
        if (!Price_New) req.error('Price_New is required');

        const vehicle = await SELECT.one.from('Vehicle').columns('Price_New').where({ Vehicle_ID });
                                                                        //
        if (!vehicle) req.reject('Vehicle not found');

        await UPDATE('Vehicle').set({Price_Old: vehicle.Price_New,Price_New}).where({ Vehicle_ID });
        return SELECT.one.from('Vehicle').where({ Vehicle_ID });

    });


this.on('DELETE', 'Vehicle', async (req) => {

    const { Vehicle_ID } = req.params[0];  
    const vehicle = await SELECT.one.from('Vehicle')
        .where({ Vehicle_ID });

    if (!vehicle) {
        return req.reject(`Vehicle ID '${Vehicle_ID}' not found`);
    }
    const result = await DELETE.from('Vehicle')
        .where({ Vehicle_ID });
    return result;
});


this.on('READ','VehicleID', async (req) => {
    return await SELECT.from(Vehicle).columns(['Vehicle_ID']);
});

//Customer
this.before('CREATE', Customer, async (req) => {
  
    const { Customer_ID, name, phone } = req.data;

    if (!Customer_ID || !name || !phone) {
        return req.reject('Customer_ID, name, and phone are required');
    }
    
    if (phone.length !== 10 ) {
        return req.reject('Phone number must be a valid 10-digit number');
    }

   
    const existing = await SELECT.one.from(Customer).where({ Customer_ID });
    if (existing) {
        return req.reject(`Customer_ID already exists`);
    }
});

    
this.on('CREATE',Customer,async(req)=>{
    const data=req.data;
    await INSERT.into(Customer).entries(data);
    const result=SELECT.from(Customer).where({Customer_ID:data.Customer_ID})
    return result;
})


this.on('READ',Customer,async(req)=>{
    const {Customer_ID}=req.data;
    if(Customer_ID)
    {
        return SELECT.from(Customer).where({Customer_ID});
    }
    else
    {
        return SELECT.from(Customer);
    }
})



this.on('UPDATE', Customer, async (req) => {

        const Customer_ID = req.params[0].Customer_ID;
        const { phone } = req.data;

        if (!Customer_ID) 
    req.error('Customer_ID is required');
        if (!phone) 
    req.error('phone is required');
        if (phone.length !== 10 ) {
    return req.reject(400, 'Phone number must be a 10-digit number');
    }

        const customer = await SELECT.one.from(Customer)
            .columns('phone')
            .where({ Customer_ID });

        if (!customer) req.reject('Customer not found');

        await UPDATE(Customer).set({ phone }) .where({ Customer_ID });

        return SELECT.one.from(Customer).where({ Customer_ID });

    });


this.on('DELETE', Customer, async (req) => {

    const { Customer_ID } = req.params[0];  
    const customer = await SELECT.one.from(Customer)
        .where({ Customer_ID });

    if (!customer) {
        return req.reject( `customer ID  not found`);
    }
    const result = await DELETE.from(Customer).where({ Customer_ID });
    return result;
});



//Orders

this.before('CREATE', Order, async (req) => {
    const { Order_ID, orderDate, customer_Customer_ID, dealer_Dealer_ID, vehicle_Vehicle_ID } = req.data;

    if (!Order_ID || !orderDate || !customer_Customer_ID || !dealer_Dealer_ID || !vehicle_Vehicle_ID)
        return req.reject('All fields with dealer and vehicle are required');

   
    const customer = await SELECT.one.from('Customer').where({ Customer_ID: customer_Customer_ID });
    if (!customer)
 return req.reject( 'Customer not there');


    const dealer = await SELECT.one.from('Dealer').where({ Dealer_ID: dealer_Dealer_ID });
    if (!dealer) 
    return req.reject('Dealer not found');

    //ordering
    const vehicle = await SELECT.one.from('Vehicle').where({ Vehicle_ID: vehicle_Vehicle_ID, dealer_Dealer_ID: dealer_Dealer_ID});  
    if (!vehicle) 
return req.reject('Vehicle not available for this dealer');

   
    const existingOrder = await SELECT.one.from('Order').where({ vehicle_Vehicle_ID });
    if (existingOrder) 
return req.reject('Vehicle is already sold');
});


this.on('CREATE', Order, async (req) => {
    const { Order_ID, orderDate, customer_Customer_ID, dealer_Dealer_ID, vehicle_Vehicle_ID } = req.data;


    await INSERT.into('Order').entries({ Order_ID, orderDate, customer_Customer_ID, dealer_Dealer_ID,vehicle_Vehicle_ID  });
    return SELECT.one.from(Order).where({ Order_ID });
});

this.on('READ',Order,async(req)=>{
    const {Order_ID}=req.data;
    if(Order_ID)
    {
        return SELECT.from(Order).where({Order_ID});
    }
    else
    {
        return SELECT.from(Order);
    }
})



this.on('UPDATE', Order, async (req) => {
    const Order_ID = req.params[0].Order_ID;
    const { orderDate } = req.data;

    if (!Order_ID)
 return req.reject(400, 'Order_ID is required');

    const order = await SELECT.one.from(Order).where({ Order_ID });
    if (!order) 
    return req.reject(`Order not found`);

    await UPDATE(Order).set({ orderDate }).where({ Order_ID });
    return await SELECT.one.from(Order).where({ Order_ID });
});

this.on('DELETE', Order, async (req) => {

    const { Order_ID } = req.data;

    if (!Order_ID) {
        return req.reject(400, 'Order_ID is required');
    }

    const order = await SELECT.one.from(Order).where({ Order_ID });

    if (!order) {
        return req.reject(404, 'Order not found');
    }

    return DELETE.from(Order).where({ Order_ID });

});


// this.before('*', (req) => {
//      const User = os.userInfo().username;

//     //const log =User+" "+req.target + " "+ new Date();
//     console.log(User);
   
  
// });


this.before(['CREATE','UPDATE'],'*', (req) => {
const userID=req.user.id;

req.data.username=userID;
req.data.createdTime=new Date();
});

  });


