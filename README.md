# Everest OSINT Adapters

Real Estate OSINT adapter modules for the Everest Intelligence Platform.  
Adapter pattern extracted from [SpiderFoot](https://github.com/smicallef/spiderfoot) (MIT).

## Architecture

Each data source = one adapter module extending `BaseOSINTAdapter`.  
Pipeline: `fetch → normalize → score → dedup → Supabase`

## Adapter Inventory (20 modules)

| Tier | Adapter | Source | Events | Status |
|------|---------|--------|--------|--------|
| 1 | realauction | RealAuction.com | AUCTION_LISTING, AUCTION_RESULT | PLANNED |
| 1 | realforeclosure | RealForeclosure.com | FORECLOSURE_LISTING | PLANNED |
| 1 | bcpao | Brevard Property Appraiser | PROPERTY_VALUE, OWNER_CHANGE | PLANNED |
| 1 | propertyonion | PropertyOnion | AUCTION_LISTING | PLANNED |
| 1 | mapwise | MapWise API | PARCEL_DATA, ZONING_DATA | PLANNED |
| 2 | clerk_brevard | Brevard Clerk (CiviTek) | LIS_PENDENS, JUDGMENT, LIEN | PLANNED |
| 3 | fema_flood | FEMA NFHL | FLOOD_ZONE_DATA | PLANNED |
| 3 | fl_gio | FL Geographic Info Office | PARCEL_GEOMETRY | PLANNED |
| 3 | nasa_firms | NASA FIRMS | FIRE_DETECTED | PLANNED |
| 3 | usda_soils | USDA Soil Survey | SOIL_DATA | PLANNED |
| 4 | zillow_zhvi | Zillow Home Value Index | HOME_VALUE_INDEX | PLANNED |
| 4 | zillow_zori | Zillow Rent Index | RENT_INDEX | PLANNED |
| 4 | zillow_inventory | Zillow Inventory/Sales | INVENTORY_LEVEL, SALE_COUNT | PLANNED |
| 4 | fhfa_hpi | FHFA House Price Index | HOUSE_PRICE_INDEX | PLANNED |
| 5 | census_acs | Census ACS 5-Year | MEDIAN_INCOME, VACANCY_RATE | PLANNED |
| 5 | census_housing | Census Housing | HOUSING_UNITS | PLANNED |
| 5 | census_economic | Census Economic | EMPLOYMENT | PLANNED |
| 5 | school_districts | FL School Districts | SCHOOL_RATING | PLANNED |

## Pattern

```python
from adapters.base import BaseOSINTAdapter, OSINTEvent

class AdapterRealAuction(BaseOSINTAdapter):
    meta = {
        'name': 'RealAuction.com',
        'summary': 'FL foreclosure auction listings and results',
        'tier': 1,
        'refresh': 'daily',
        'counties': 46,
    }

    def produced_events(self):
        return ['AUCTION_LISTING', 'AUCTION_RESULT']

    async def fetch(self, county=None, since=None):
        # Your scraper logic here
        ...

    def normalize(self, raw_data):
        return OSINTEvent(
            event_type='AUCTION_LISTING',
            county=raw_data['county'],
            pin=raw_data.get('parcel_id'),
            data={...},
            raw_data=raw_data
        )
```

## Related Repos

- [everest-osint-dashboard](https://github.com/breverdbidder/everest-osint-dashboard) — Forked from WorldMonitor (AGPL-3.0)
- [everest-court-scraper](https://github.com/breverdbidder/everest-court-scraper) — Forked from court-scraper (ISC)

## License

MIT — Adapter pattern extracted from SpiderFoot (MIT).
