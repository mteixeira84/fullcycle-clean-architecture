import { Sequelize } from "sequelize-typescript";
import ProductModel from "../../../infrastructure/product/repository/sequelize/product.model";
import ProductRepository from "../../../infrastructure/product/repository/sequelize/product.repository";
import Product from "../../../domain/product/entity/product";
import CreateProductUseCase from "./create.product.usecase";

describe("Test create product use case", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([ProductModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a product", async () => {
    const productRepository = new ProductRepository();
    const usecase = new CreateProductUseCase(productRepository);

    const input = {
      name: "Product A",
      price: 10,
    };

    const result = await usecase.execute(input);

    const output = {
      id: result.id,
      name: "Product A",
      price: 10,
    };

    expect(result).toEqual(output);
    expect(output.name).toBe("Product A");
    expect(output.price).toBe(10);
  });

  it("should thrown an error when name is missing", async () => {
    const productRepository = new ProductRepository();
    const usecase = new CreateProductUseCase(productRepository);

    const input = {
      name: "",
      price: 10,
    };

    await expect(usecase.execute(input)).rejects.toThrow("Name is required");
  });

  it("should throw error when price is less than zero", async () => {
    const productRepository = new ProductRepository();
    const usecase = new CreateProductUseCase(productRepository);

    const input = {
      name: "Product A",
      price: -1,
    };

    await expect(usecase.execute(input)).rejects.toThrowError(
      "Price must be greater than zero"
    );
  });
});
