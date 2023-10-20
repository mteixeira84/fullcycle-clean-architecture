import { SendConsoleLogAddressHandler } from "../../customer/event/handler/send-consolelog-change-address.handler";
import { CustomerChangedAddressEvent } from "./event-customer-changed-address";
import EventDispatcher from "./event-dispatcher";

describe("Customer changed of address event tests", () => {
  it("should notify the event handlers of the change of address of a customer", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler1 = new SendConsoleLogAddressHandler();

    const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");

    eventDispatcher.register("CustomerChangedAddressEvent", eventHandler1);

    expect(
      eventDispatcher.getEventHandlers["CustomerChangedAddressEvent"].length
    ).toBe(1);

    const eventAddress = {
      customer: {
        id: "123",
        name: "Customer 1",
        oldAddress: {
          street: "Street 1",
          number: "1",
          city: "City 1",
          zip: "1",
        },
        newAddress: {
          street: "Street 2",
          number: "2",
          city: "City 2",
          zip: "2",
        },
      },
    };

    const customerCreatedEvent = new CustomerChangedAddressEvent(eventAddress);

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandler1).toHaveBeenCalled();
  });
});
