import Order from "../../domain/entity/order";
import OrderItem from "../../domain/entity/order_item";
import OrderRepositoryInterface from "../../domain/repository/order-repository.interface";
import OrderItemModel from "../db/sequelize/model/order-item.model";
import OrderModel from "../db/sequelize/model/order.model";

function orderItemModelToOrderItem(orderItemModel: OrderItemModel) {
  return new OrderItem(
    orderItemModel.id,
    orderItemModel.name,
    orderItemModel.price,
    orderItemModel.productId,
    orderItemModel.quantity
  );
}

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    try {
      const sequelize = OrderModel.sequelize;
      await sequelize.transaction(async (t) => {
        await OrderItemModel.destroy({
          where: { order_id: entity.id },
          transaction: t,
        });
        const items = entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
          order_id: entity.id,
        }));
        await OrderItemModel.bulkCreate(items, { transaction: t });
        await OrderModel.update(
          { total: entity.total() },
          { where: { id: entity.id }, transaction: t }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }

  /*
  async update(entity: Order): Promise<void> {
    const updatedItems = entity.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      productId: item.productId,
      quantity: item.quantity,
    }));
    const orderItems = await OrderItemModel.findAll({
      where: { order_id: entity.id },
    });

    for (const updatedItem of updatedItems) {
      const itemsExistsModel = orderItems.find(
        (orderItem) => orderItem.id === updatedItem.id
      );
      try {
        if (!itemsExistsModel) {
          await OrderItemModel.create({ ...updatedItem, orderId: entity.id });
        }
      } catch (err) {
        console.log(err);
      }
    }

    for (const orderItem of orderItems) {
      const itemExistsOnUpdatedItems = updatedItems.find(
        (updatedItem) => updatedItem.id === orderItem.id
      );

      if (!itemExistsOnUpdatedItems) {
        await OrderItemModel.destroy({ where: { id: orderItem.id } });
      }
    }

    await OrderModel.update(
      { total: entity.total() },
      { where: { id: entity.id } }
    );
  }*/

  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: { id },
        include: [{ model: OrderItemModel }],
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    const orderItems = orderModel.items.map(orderItemModelToOrderItem);

    const order = new Order(orderModel.id, orderModel.customer_id, orderItems);
    return order;
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({
      include: [{ model: OrderItemModel }],
    });

    const orders = orderModels.map((orderModels) => {
      const orderItems = orderModels.items.map(orderItemModelToOrderItem);
      const order = new Order(
        orderModels.id,
        orderModels.customer_id,
        orderItems
      );

      return order;
    });
    return orders;
  }
}
