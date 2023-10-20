import SendConsoleLog1Handler from "../../customer/event/handler/send-consolelog1-customer-is-created.handler";
import SendConsoleLog2Handler from "../../customer/event/handler/send-consolelog2-customer-is-created.handler";
import { CustomerCreatedEvent } from "./event-customer-created";
import EventDispatcher from "./event-dispatcher";

describe("Customer events tests", () => {
  it("should notify when customer is created", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler1 = new SendConsoleLog1Handler();
    const eventHandler2 = new SendConsoleLog2Handler();

    const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
    const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

    eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
    ).toBe(2);

    const eventPayload = {
      customer: {
        id: "123",
        name: "Customer 1",
        active: false,
      },
    };

    const customerCreatedEvent = new CustomerCreatedEvent(eventPayload);

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandler1).toHaveBeenCalled();
    expect(spyEventHandler2).toHaveBeenCalled();
  });
});
