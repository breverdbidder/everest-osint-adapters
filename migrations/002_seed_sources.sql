-- Seed 20 adapter definitions into osint_sources
INSERT INTO osint_sources (adapter_id, name, tier, refresh_freq, counties, status, config) VALUES
  -- Tier 1: Owned/Scraped
  ('realauction', 'RealAuction.com', 1, 'daily', 46, 'planned', '{"events":["AUCTION_LISTING","AUCTION_RESULT","AUCTION_CANCELLED"]}'),
  ('realforeclosure', 'RealForeclosure.com', 1, 'daily', 67, 'planned', '{"events":["FORECLOSURE_LISTING","FORECLOSURE_SALE"]}'),
  ('bcpao', 'Brevard County Property Appraiser', 1, 'weekly', 1, 'planned', '{"events":["PROPERTY_VALUE","OWNER_CHANGE","TAX_ASSESSMENT"]}'),
  ('propertyonion', 'PropertyOnion', 1, 'daily', 67, 'planned', '{"events":["AUCTION_LISTING","PROPERTY_DETAIL"]}'),
  ('mapwise', 'MapWise API', 1, 'biweekly', 67, 'planned', '{"events":["PARCEL_DATA","OWNER_DATA","ZONING_DATA"]}'),
  ('existing_scrapers', '5-Cylinder Scraper Engine', 1, 'on_demand', 67, 'planned', '{"events":["RAW_SCRAPE_DATA"]}'),
  -- Tier 2: Court Records
  ('clerk_brevard', 'Brevard County Clerk of Courts (CiviTek)', 2, 'daily', 1, 'planned', '{"events":["LIS_PENDENS","JUDGMENT","SATISFACTION","LIEN","MORTGAGE","DEED_TRANSFER"],"platform":"civitek"}'),
  ('clerk_statewide', 'FL Clerk of Courts (multi-platform)', 2, 'weekly', 67, 'planned', '{"events":["LIS_PENDENS","JUDGMENT","SATISFACTION"],"platforms":["civitek","odyssey","mycase"],"phase":"v2"}'),
  -- Tier 3: Spatial/Environmental
  ('fema_flood', 'FEMA Flood Zones', 3, 'quarterly', 67, 'planned', '{"events":["FLOOD_ZONE_DATA"],"api":"https://hazards.fema.gov/gis/nfhl/rest/services"}'),
  ('fl_gio', 'Florida Geographic Information Office', 3, 'monthly', 67, 'planned', '{"events":["PARCEL_GEOMETRY","LAND_USE"]}'),
  ('nasa_firms', 'NASA FIRMS Fire Detection', 3, 'daily', 67, 'planned', '{"events":["FIRE_DETECTED","THERMAL_ANOMALY"],"api":"https://firms.modaps.eosdis.nasa.gov/api/"}'),
  ('usda_soils', 'USDA Soil Survey', 3, 'annual', 67, 'planned', '{"events":["SOIL_DATA"]}'),
  -- Tier 4: Market Intelligence
  ('zillow_zhvi', 'Zillow Home Value Index', 4, 'monthly', 67, 'planned', '{"events":["HOME_VALUE_INDEX"],"source":"FREE CSV"}'),
  ('zillow_zori', 'Zillow Rent Index', 4, 'monthly', 67, 'planned', '{"events":["RENT_INDEX"],"source":"FREE CSV"}'),
  ('zillow_inventory', 'Zillow Inventory/Sales/Price Cuts', 4, 'monthly', 67, 'planned', '{"events":["INVENTORY_LEVEL","SALE_COUNT","PRICE_CUT_PCT","DAYS_ON_MARKET","SALE_LIST_RATIO"],"source":"FREE CSV"}'),
  ('fhfa_hpi', 'FHFA House Price Index', 4, 'quarterly', 67, 'planned', '{"events":["HOUSE_PRICE_INDEX"]}'),
  -- Tier 5: Enrichment
  ('census_acs', 'Census American Community Survey', 5, 'annual', 67, 'planned', '{"events":["MEDIAN_INCOME","POVERTY_RATE","VACANCY_RATE","OWNER_RENTER_RATIO","HOUSING_VALUE"]}'),
  ('census_housing', 'Census Housing Characteristics', 5, 'annual', 67, 'planned', '{"events":["HOUSING_UNITS","AGE_OF_STOCK","UNITS_IN_STRUCTURE"]}'),
  ('census_economic', 'Census Economic Data', 5, 'annual', 67, 'planned', '{"events":["EMPLOYMENT","COMMUTE_PATTERNS","INDUSTRY_MIX"]}'),
  ('school_districts', 'FL School District Boundaries + Ratings', 5, 'annual', 67, 'planned', '{"events":["SCHOOL_RATING","DISTRICT_BOUNDARY"]}')
ON CONFLICT (adapter_id) DO NOTHING;
