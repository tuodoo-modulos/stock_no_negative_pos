# -*- coding: utf-8 -*-
{
    "name": "MUNIN | Stock no negative pos",
    "summary": """
        

        """,
    "description": """

    """,
    "author": "Munin",  # RR
    "website": "https://www.munin.mx",
    "category": "Uncategorized",
    "version": "1.1.1",
    "depends": ["base", "point_of_sale"],
    # always loaded
    "data": ["views/pos_config_views.xml"],
    "assets": {
        'point_of_sale._assets_pos': [
            "stock_no_negative_pos/static/src/**/*",
        ],
    },
    "license": "AGPL-3",
}
