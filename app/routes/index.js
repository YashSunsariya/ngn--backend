import express from 'express';
const app = express();
import userauthRoutes from "../routes/user.js";
import brandRoutes from "../routes/brand.js";
import categoryRoutes from "../routes/category.js";
import productRoutes from "../routes/product.js";
import publicRoutes from "../routes/clientRoutes/publicRoutes.js";
import addressRoutes from "../routes/address.js";

export default(app)=>{

    app.use("/api/v1/auth/user",userauthRoutes);
    app.use("/api/v1/products/brand",brandRoutes);
    app.use("/api/v1/products/category",categoryRoutes);
    app.use("/api/v1/products",productRoutes);
    app.use("/api/v1/public",publicRoutes);
    app.use("/api/v1/address",addressRoutes);

}