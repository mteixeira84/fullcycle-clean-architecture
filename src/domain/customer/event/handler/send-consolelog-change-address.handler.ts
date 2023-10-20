import { CustomerChangedAddressEvent } from "../../../@shared/event/event-customer-changed-address";
import EventHandlerInterface from "../../../@shared/event/event-handler.interface";

export class SendConsoleLogAddressHandler
  implements EventHandlerInterface<CustomerChangedAddressEvent>
{
  handle(event: CustomerChangedAddressEvent): void {
    const { id, name, newAddress } = event.eventData.customer;

    console.log(
      `Address of client with id ${id} and name ${name} changed to street: ${newAddress.street}, number: ${newAddress.number}, city: ${newAddress.city} and zip: ${newAddress.zip}`
    );
  }
}
