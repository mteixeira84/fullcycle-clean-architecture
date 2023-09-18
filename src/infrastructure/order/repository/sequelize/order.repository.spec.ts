import { Sequelize } from "sequelize-typescript";
import OrderRepository from "./order.repository";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import Product from "../../../../domain/product/entity/product";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Order from "../../../../domain/checkout/entity/order";
import OrderModel from "./order.model";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import OrderItemModel from "./order-item.model";
import ProductModel from "../../../product/repository/sequelize/product.model";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          productId: "123",
        },
      ],
    });
  });

  it("should update order and yours items", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product1 = new Product("1", "Product 1", 10);
    const product2 = new Product("2", "Product 2", 20);
    await productRepository.create(product1);
    await productRepository.create(product2);

    const orderItem1 = new OrderItem(
      "1",
      product1.name,
      product1.price,
      product1.id,
      1
    );
    const orderItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      1
    );

    const order = new Order("123", "123", [orderItem1, orderItem2]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const product3 = new Product("3", "Product 3", 30);

    const orderItem3 = new OrderItem(
      "3",
      product3.name,
      product3.price,
      product3.id,
      1
    );

    order.addOrderItem(orderItem3);

    await orderRepository.update(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.items.length).toBe(3);
    expect(orderModel.total).toBe(order.total());

    order.removeOrderItem(orderItem1.id);
    order.removeOrderItem(orderItem2.id);

    await orderRepository.update(order);

    const orderModels = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModels?.items.length).toBe(1);
    expect(orderModels?.total).toBe(order.total());
  });

  it("should find a order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product1 = new Product("1", "Product 1", 10);
    await productRepository.create(product1);

    const orderRepository = new OrderRepository();
    const orderItem1 = new OrderItem(
      "1",
      product1.name,
      product1.price,
      product1.id,
      1
    );
    const order = new Order("123", "123", [orderItem1]);
    await orderRepository.create(order);

    const orderFound = await orderRepository.find(order.id);

    expect(orderFound).toEqual(order);
  });

  it("should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product1 = new Product("1", "Product 1", 10);
    const product2 = new Product("2", "Product 2", 20);
    const product3 = new Product("3", "Product 3", 30);

    await productRepository.create(product1);
    await productRepository.create(product2);
    await productRepository.create(product3);

    const orderRepository = new OrderRepository();
    const orderItem1 = new OrderItem(
      "1",
      product1.name,
      product1.price,
      product1.id,
      1
    );

    const orderItem2 = new OrderItem(
      "2",
      product1.name,
      product1.price,
      product1.id,
      1
    );

    const orderItem3 = new OrderItem(
      "3",
      product1.name,
      product1.price,
      product1.id,
      1
    );

    const order1 = new Order("111", "123", [orderItem1, orderItem2]);
    const order2 = new Order("222", "123", [orderItem3]);

    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const orders = await orderRepository.findAll();

    expect(orders.length).toBe(2);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
  });
});
