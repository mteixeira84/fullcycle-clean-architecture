import EventInterface from "./event.interface";

interface Address {
  street: string;
  number: string;
  city: string;
  zip: string;
}

interface CustomerChangedAddressEventData {
  customer: {
    id: string;
    name: string;
    newAddress: Address;
  };
}

export class CustomerChangedAddressEvent implements EventInterface {
  dateTimeOccurred: Date;
  eventData: CustomerChangedAddressEventData;

  constructor(eventData: CustomerChangedAddressEventData) {
    this.dateTimeOccurred = new Date();
    this.eventData = eventData;
  }
}
