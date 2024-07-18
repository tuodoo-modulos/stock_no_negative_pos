# -*- coding: utf-8 -*-
import logging

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)


class PosSession(models.Model):
    _inherit = "pos.session"

    def _pos_ui_models_to_load(self):
        res = super()._pos_ui_models_to_load()
        res.append("stock.quant")
        return res

    def _loader_params_stock_quant(self):
        return {
            "search_params": {
                "domain": [("location_id", "=", self.config_id.location_id.id)],
                "fields": [
                    "location_id",
                    "product_id",
                    "lot_id",
                    "product_tmpl_id",
                    "available_quantity",
                ],
            }
        }

    def _get_pos_ui_stock_quant(self, params):
        if not self.config_id.location:
            return []
        return self.env["stock.quant"].search_read(**params["search_params"])
