namespace VehicleMgmt;

entity State :UserInfo{
    key State_ID: String;
    State_Name: String;
}


entity Dealer :UserInfo{
    key Dealer_ID: String;
    Dealer_Name: String;
    Location: String;
    state: Association to State;
    vehicles: Association to many Vehicle on vehicles.dealer = $self; 

    
}




entity Vehicle:UserInfo {
    key Vehicle_ID: String;
    Model: String;
    Price_Old: Decimal(10,2);
    Price_New: Decimal(10,2);
    dealer: Association to Dealer; 
    state: Association to State; 
    orders: Composition of many Order on orders.vehicle = $self;
}


entity Customer :UserInfo{
    key Customer_ID: String;
    name: String;
    phone: String;
}


entity Order:UserInfo {
    key Order_ID: String;
    orderDate: Date;
    customer: Association to Customer;
    vehicle: Association to Vehicle;
    dealer: Association to Dealer;  
}


aspect UserInfo {
    username    : String;
    createdTime : Timestamp;
}