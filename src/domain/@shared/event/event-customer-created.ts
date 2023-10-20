import EventInterface from "./event.interface";

interface CustomerCreatedEventData {
  customer: {
    id: string;
    name: string;
    active: boolean;
  };
}

export class CustomerCreatedEvent implements EventInterface {
  dateTimeOccurred: Date;
  eventData: CustomerCreatedEventData;

  constructor(eventData: CustomerCreatedEventData) {
    this.dateTimeOccurred = new Date();
    this.eventData = eventData;
  }
}
