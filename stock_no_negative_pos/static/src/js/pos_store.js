/** @odoo-module */
import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { Orderline, Order } from "@point_of_sale/app/store/models";

let pos_notification = undefined;
function error_not_enough_stock(product) {
  const msj = "No hay stock suficiente " + product.display_name;
  pos_notification.add(msj, 4000);
}

function validate_stock(product, new_qty) {
  //Dont count service products
  if (product.type === "service") return true;

  new_qty = new_qty * 1;
  const selected_id = product.id;
  const qty_real_time = product_inventory_real_time[selected_id];

  if (!qty_real_time) {
    return false;
  }

  const available_quantity = qty_real_time.available_quantity;
  if (available_quantity < new_qty) {
    error_not_enough_stock(product);
    return false;
  }
  return true;
}

let product_inventory_real_time = {};

patch(PosStore.prototype, {
  async _processData(loadedData) {
    pos_notification = this.env.services.pos_notification;
    await super._processData(...arguments);
    this.stock_quant = loadedData["stock.quant"];

    this.product_inventory_real_time = this.stock_quant.reduce((acc, value) => {
      const id = value.product_id[0];
      acc[id] = {
        product_id: value.product_id,
        available_quantity: value.available_quantity,
        stock_quant: value,
        calculate_qty: () => {
          const POS = this.env.services.pos;
          // Get all orderlines that have the same product_id
          if (!POS?.get_order) return value.available_quantity;

          const orderlines =
            POS.get_order()?.orderlines.filter(
              (orderline) => orderline.product.id === id
            ) ?? [];

          const qty = orderlines.reduce(
            (acc, orderline) => acc + orderline.get_quantity(),
            0
          );

          const available_quantity = value.available_quantity - qty;
          return available_quantity;
        },
      };

      return acc;
    }, {});

    product_inventory_real_time = this.product_inventory_real_time;
  },

  async _save_to_server(orders, options) {
    for (const key in this.product_inventory_real_time) {
      if (Object.hasOwnProperty.call(this.product_inventory_real_time, key)) {
        const element = this.product_inventory_real_time[key];
        const updated_qty = element.calculate_qty();
        element.available_quantity = updated_qty;
      }
    }
    return super._save_to_server(orders, options);
  },

  async addProductToCurrentOrder(product, options = {}) {
    if (!validate_stock(product, 1)) return false;
    super.addProductToCurrentOrder(product, options);
  },
});

patch(Orderline.prototype, {
  set_quantity(quantity, keep_price) {
    let result = super.set_quantity(quantity, keep_price);
    if (!validate_stock(this.product, quantity)) return false;
    return result;
  },
});
patch(Order.prototype, {
  pay()
  { 

    for (const orderline of this.orderlines.models) {
      if (!validate_stock(orderline.product, orderline.quantity)) return false;
    }
    
    return super.pay();
  },
});
