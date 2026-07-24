

import { responseHandler } from "../utils/responseHandler.js";
import { getPagination } from "../utils/pagination.js";
// import razorpay from "../configs/razorpay.js";
import Cart from './../../models/cart/cart';
import {orderItemSchema, orderSchema} from './../../models/order/order';
import razorpay from './../../config/razorpay';


// =================================================
// GENERATE ORDER NUMBER
// ORDER001, ORDER002, ORDER003
// =================================================
const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne({
    order_number: {
      $exists: true,
      $ne: null,
    },
  }).sort({
    createdAt: -1,
  });

  let nextNumber = 1;

  if (lastOrder?.order_number) {
    const lastNumber = parseInt(
      lastOrder.order_number
        .replace("ORDER", ""),
      10
    );

    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `ORDER${String(nextNumber).padStart(3, "0")}`;
};


// =================================================
// CREATE ORDER
// =================================================
// export const createOrder = async (req, res) => {
//   try {
//     const user_id = req.user._id;

//     const {
//       address_id,
//       payment_method = "COD",
//     } = req.body;


//     // ---------------------------------------------
//     // 1. CHECK ADDRESS
//     // ---------------------------------------------
//     const address = await Address.findOne({
//       _id: address_id,
//       user_id,
//     });

//     if (!address) {
//       return responseHandler(
//         res,
//         404,
//         false,
//         "Address not found."
//       );
//     }


//     // ---------------------------------------------
//     // 2. GET CART
//     // ---------------------------------------------
//     const cartItems = await Cart.find({
//       user_id,
//     }).populate("product_id");

//     if (
//       !cartItems ||
//       cartItems.length === 0
//     ) {
//       return responseHandler(
//         res,
//         400,
//         false,
//         "Cart is empty."
//       );
//     }


//     // ---------------------------------------------
//     // 3. CHECK DELETED PRODUCTS
//     // ---------------------------------------------
//     const invalidProduct =
//       cartItems.find(
//         (item) => !item.product_id
//       );

//     if (invalidProduct) {
//       return responseHandler(
//         res,
//         400,
//         false,
//         "One or more products are no longer available."
//       );
//     }


//     // ---------------------------------------------
//     // 4. CALCULATE PRICE
//     // ---------------------------------------------
//     let subtotal = 0;

//     cartItems.forEach((item) => {
//       subtotal +=
//         item.product_id.price *
//         item.quantity;
//     });

//     const discount = 0;
//     const delivery_charge = 40;
//     const tax = 0;

//     const total_amount =
//       subtotal -
//       discount +
//       delivery_charge +
//       tax;


//     // =================================================
//     // ONLINE PAYMENT - RAZORPAY
//     // =================================================
//     if (
//       payment_method === "ONLINE"
//     ) {
//       const razorpayOrder =
//         await razorpay.orders.create({

//           amount: Math.round(
//             total_amount * 100
//           ),

//           currency: "INR",

//           receipt:
//             `receipt_${Date.now()}`,

//         });


//       return responseHandler(
//         res,
//         200,
//         true,
//         "Razorpay order created successfully.",
//         {
//           razorpay_order_id:
//             razorpayOrder.id,

//           amount:
//             razorpayOrder.amount,

//           currency:
//             razorpayOrder.currency,

//           address_id,

//           payment_method: "ONLINE",
//         }
//       );
//     }


//     // =================================================
//     // GENERATE ORDER NUMBER
//     // =================================================
//     const order_number =
//       await generateOrderNumber();


//     // =================================================
//     // CREATE COD ORDER
//     // =================================================
//     const order =
//       await Order.create({

//         order_number,

//         user_id,

//         user_details: {

//           first_name:
//             req.user.first_name,

//           last_name:
//             req.user.last_name,

//           email:
//             req.user.email,

//           phone_no:
//             req.user.phone_no,

//         },


//         address_id,


//         address_details: {

//           full_name:
//             address.full_name,

//           phone_no:
//             address.phone_no,

//           address_line:
//             address.address_line_1,

//           city:
//             address.city,

//           state:
//             address.state,

//           pincode:
//             address.pincode,

//         },


//         finance_details: {

//           subtotal,

//           discount,

//           delivery_charge,

//           tax,

//           total_amount,

//         },


//         payment_details: {

//           payment_method:
//             "COD",

//           payment_status:
//             "PENDING",

//         },


//         order_status:
//           "PENDING",

//       });


//     // =================================================
//     // CREATE ORDER ITEMS
//     // =================================================
//     const orderItems =
//       cartItems.map((item) => {

//         const product =
//           item.product_id;

//         return {

//           order_id:
//             order._id,

//           product_name:
//             product.product_name,

//           price:
//             product.price,

//           quantity:
//             item.quantity,

//           total_price:
//             product.price *
//             item.quantity,

//         };

//       });


//     // ---------------------------------------------
//     // SAVE ORDER ITEMS
//     // ---------------------------------------------
//     await OrderItem.insertMany(
//       orderItems
//     );


//     // ---------------------------------------------
//     // DELETE CART
//     // ---------------------------------------------
//     await Cart.deleteMany({
//       user_id,
//     });


//     // ---------------------------------------------
//     // RESPONSE
//     // ---------------------------------------------
//     return responseHandler(
//       res,
//       201,
//       true,
//       "COD order created successfully.",
//       {
//         order,
//         items:
//           orderItems,
//       }
//     );


//   } catch (error) {

//     console.error(
//       "Create Order Error:",
//       error
//     );

//     return responseHandler(
//       res,
//       500,
//       false,
//       "Internal Server Error",
//       error.message
//     );
//   }
// };


// =================================================
// CREATE ORDER
// =================================================
export const createOrder = async (req, res) => {
  try {
    const user_id = req.user._id;

    const {
      address_id,
      payment_method = "COD",
    } = req.body;

    // ---------------------------------------------
    // 1. CHECK ADDRESS
    // ---------------------------------------------
    const address = await Address.findOne({
      _id: address_id,
      user_id,
    });

    if (!address) {
      return responseHandler(
        res,
        404,
        false,
        "Address not found."
      );
    }

    // ---------------------------------------------
    // 2. GET CART
    // ---------------------------------------------
    const cartItems = await Cart.find({
      user_id,
    }).populate("product_id");

    if (
      !cartItems ||
      cartItems.length === 0
    ) {
      return responseHandler(
        res,
        400,
        false,
        "Cart is empty."
      );
    }

    // ---------------------------------------------
    // 3. CHECK DELETED PRODUCTS
    // ---------------------------------------------
    const invalidProduct = cartItems.find(
      (item) => !item.product_id
    );

    if (invalidProduct) {
      return responseHandler(
        res,
        400,
        false,
        "One or more products are no longer available."
      );
    }

    // ---------------------------------------------
    // 4. CALCULATE PRICE
    // ---------------------------------------------
    let subtotal = 0;

    cartItems.forEach((item) => {
      subtotal +=
        item.product_id.price *
        item.quantity;
    });

    const discount = 0;
    const delivery_charge = 40;
    const tax = 0;

    const total_amount =
      subtotal -
      discount +
      delivery_charge +
      tax;

    // ---------------------------------------------
    // 5. GENERATE YOUR ORDER NUMBER
    // ---------------------------------------------
    const order_number =
      await generateOrderNumber();

    // =================================================
    // 6. ONLINE PAYMENT - RAZORPAY
    // =================================================
    let razorpay_order_id = null;

    if (payment_method === "ONLINE") {
      const razorpayOrder =
        await razorpay.orders.create({
          amount: Math.round(
            total_amount * 100
          ),

          currency: "INR",

          receipt: order_number,

          notes: {
            order_number,
            user_id: user_id.toString(),
          },
        });

      razorpay_order_id =
        razorpayOrder.id;
    }

    // =================================================
    // 7. CREATE ORDER IN YOUR DATABASE
    // =================================================
    const order = await Order.create({

      order_number,

      user_id,

      user_details: {
        first_name:
          req.user.first_name,

        last_name:
          req.user.last_name,

        email:
          req.user.email,

        phone_no:
          req.user.phone_no,
      },

      address_id,

      address_details: {
        full_name:
          address.full_name,

        phone_no:
          address.phone_no,

        address_line:
          address.address_line_1,

        city:
          address.city,

        state:
          address.state,

        pincode:
          address.pincode,
      },

      finance_details: {
        subtotal,

        discount,

        delivery_charge,

        tax,

        total_amount,
      },

      payment_details: {

        payment_method,

        payment_status:
          payment_method === "ONLINE"
            ? "PENDING"
            : "PENDING",

        razorpay_order_id,

        razorpay_payment_id: null,
      },

      order_status:
        "PENDING",
    });

    // =================================================
    // 8. CREATE ORDER ITEMS
    // =================================================
    const orderItems =
      cartItems.map((item) => {

        const product =
          item.product_id;

        return {

          order_id:
            order._id,

          product_name:
            product.product_name,

          price:
            product.price,

          quantity:
            item.quantity,

          total_price:
            product.price *
            item.quantity,
        };
      });

    // =================================================
    // 9. SAVE ORDER ITEMS
    // =================================================
    await OrderItem.insertMany(
      orderItems
    );

    // =================================================
    // 10. DELETE CART
    // =================================================
    await Cart.deleteMany({
      user_id,
    });

    // =================================================
    // 11. RESPONSE
    // =================================================
    return responseHandler(
      res,
      201,
      true,
      payment_method === "ONLINE"
        ? "Online order created successfully."
        : "COD order created successfully.",
      {

        // Your MongoDB order
        order,

        // Your MongoDB order items
        items: orderItems,

        // Razorpay information
        ...(payment_method === "ONLINE" && {
          razorpay: {
            razorpay_order_id,
            amount:
              Math.round(
                total_amount * 100
              ),
            currency: "INR",
          },
        }),
      }
    );

  } catch (error) {

    console.error(
      "Create Order Error:",
      error
    );

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error",
      error.message
    );
  }
};

// =================================================
// GET ORDER HISTORY
// =================================================
// Shows only:
// Product Name
// Price
// Quantity
// Order Number
// =================================================
export const getOrderHistory = async (
  req,
  res
) => {

  try {

    const user_id =
      req.user._id;


    const {
      page,
      limit,
      skip,
    } =
      getPagination(req);


    // ---------------------------------------------
    // TOTAL ORDERS
    // ---------------------------------------------
    const totalRecords =
      await Order.countDocuments({
        user_id,
      });


    // ---------------------------------------------
    // GET ORDERS
    // ---------------------------------------------
    const orders =
      await Order.find({
        user_id,
      })
        .select(
          "order_number createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean();


    // ---------------------------------------------
    // GET ONLY PRODUCT DETAILS
    // ---------------------------------------------
    const ordersWithItems =
      await Promise.all(

        orders.map(
          async (order) => {

            const items =
              await OrderItem.find({
                order_id:
                  order._id,
              })
                .select(
                  "product_name price quantity -_id"
                )
                .lean();


            return {

              order_number:
                order.order_number,

              createdAt:
                order.createdAt,

              items,

            };

          }
        )

      );


    return responseHandler(
      res,
      200,
      true,
      "Orders fetched successfully.",
      ordersWithItems,
      {
        page,
        limit,
        totalRecords,
        totalPages:
          Math.ceil(
            totalRecords / limit
          ),
      }
    );


  } catch (error) {

    console.error(
      "Get Order History Error:",
      error
    );

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error",
      error.message
    );

  }

};


// =================================================
// GET ORDER BY ID
// =================================================
// Complete order information
// =================================================
export const getOrderById = async (
  req,
  res
) => {

  try {

    const user_id =
      req.user._id;


    const {
      order_id,
    } =
      req.params;


    // ---------------------------------------------
    // FIND ORDER
    // ---------------------------------------------
    const order =
      await Order.findOne({

        _id:
          order_id,

        user_id,

      })
        .populate(
          "user_id",
          "first_name last_name email phone_no"
        )
        .populate(
          "address_id"
        )
        .lean();


    if (!order) {

      return responseHandler(
        res,
        404,
        false,
        "Order not found."
      );

    }


    // ---------------------------------------------
    // GET ORDER ITEMS
    // ---------------------------------------------
    const items =
      await OrderItem.find({

        order_id:
          order._id,

      })
        .select(
          "product_name price quantity total_price -_id"
        )
        .lean();


    return responseHandler(
      res,
      200,
      true,
      "Order fetched successfully.",
      {

        ...order,

        items,

      }
    );


  } catch (error) {

    console.error(
      "Get Order By ID Error:",
      error
    );

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error",
      error.message
    );

  }

};


// =================================================
// CANCEL ORDER
// =================================================
export const cancelOrder = async (
  req,
  res
) => {

  try {

    const user_id =
      req.user._id;


    const {
      order_id,
    } =
      req.params;


    // ---------------------------------------------
    // FIND ORDER
    // ---------------------------------------------
    const order =
      await Order.findOne({

        _id:
          order_id,

        user_id,

      });


    if (!order) {

      return responseHandler(
        res,
        404,
        false,
        "Order not found."
      );

    }


    // ---------------------------------------------
    // CHECK STATUS
    // ---------------------------------------------
    const nonCancelableStatuses = [

      "SHIPPED",

      "DELIVERED",

      "CANCELLED",

    ];


    if (

      nonCancelableStatuses.includes(

        order.order_status

      )

    ) {

      return responseHandler(

        res,

        400,

        false,

        `Order cannot be cancelled because its status is ${order.order_status}.`

      );

    }


    // ---------------------------------------------
    // CANCEL ORDER
    // ---------------------------------------------
    order.order_status =
      "CANCELLED";


    // ---------------------------------------------
    // REFUND PAYMENT
    // ---------------------------------------------
    if (

      order.payment_details
        .payment_status ===
      "PAID"

    ) {

      order.payment_details
        .payment_status =
        "REFUNDED";

    }


    await order.save();


    return responseHandler(

      res,

      200,

      true,

      "Order cancelled successfully.",

      order

    );


  } catch (error) {

    console.error(

      "Cancel Order Error:",

      error

    );


    return responseHandler(

      res,

      500,

      false,

      "Internal Server Error",

      error.message

    );

  }

};