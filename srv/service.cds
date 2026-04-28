using { VehicleMgmt as db } from '../db/schema';

service VehicleService {
 @cds.redirection.target
    entity State    as projection on db.State;
    entity Dealer   as projection on db.Dealer;

    
    @cds.redirection.target
    entity Vehicle  as projection on db.Vehicle;

    entity VehicleID as projection on db.Vehicle;

    entity StateID as projection on db.State;

    entity Customer as projection on db.Customer;
    entity Order as projection on db.Order;

}