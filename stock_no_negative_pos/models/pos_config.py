# -*- coding: utf-8 -*-
import logging

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)


class PosConfig(models.Model):
    _inherit = 'pos.config'
    
    location = fields.Boolean(string='Display Warehouse Stock')
    location_id = fields.Many2one('stock.location', string='Stock Location')

