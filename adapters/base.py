"""
Everest OSINT Base Adapter
Extracted from SpiderFoot (MIT) module pattern — adapted for real estate intelligence.

Each data source = one adapter module following this standardized interface.
Adapters produce OSINTEvent objects that flow into Supabase osint_events table.
"""

import hashlib
import json
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field, asdict
from datetime import datetime, date
from typing import List, Optional, Dict, Any


@dataclass
class OSINTEvent:
    """
    Standardized event object for all OSINT data.
    Inspired by SpiderFoot's SpiderFootEvent (confidence/visibility/risk scoring).

    All adapter outputs normalize to this format before insertion into osint_events.
    """
    event_type: str          # LIS_PENDENS, AUCTION_LISTING, HOME_VALUE_INDEX, etc.
    county: str              # FL county name
    data: Dict[str, Any]     # Normalized event payload
    source_adapter: str      # Adapter ID that produced this event

    # Optional fields
    pin: Optional[str] = None           # Parcel ID (joins to zw_parcels)
    event_date: Optional[date] = None   # When the event occurred in the real world
    raw_data: Optional[Dict] = None     # Original source data (for debugging)

    # Scoring (SpiderFoot pattern)
    confidence: int = 50     # How sure are we this data is valid, 0-100
    risk: int = 0            # How much risk does this represent, 0-100

    # Auto-generated
    fetched_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    dedup_hash: str = ""     # SHA256 for deduplication, computed on creation

    def __post_init__(self):
        """Compute dedup hash on creation."""
        if not self.dedup_hash:
            self.dedup_hash = self._compute_hash()

    def _compute_hash(self) -> str:
        """SHA256 hash for deduplication across fetches."""
        key = json.dumps({
            "type": self.event_type,
            "county": self.county,
            "pin": self.pin,
            "date": str(self.event_date) if self.event_date else None,
            "data_sig": hashlib.md5(
                json.dumps(self.data, sort_keys=True, default=str).encode()
            ).hexdigest()
        }, sort_keys=True)
        return hashlib.sha256(key.encode()).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dict for Supabase insertion."""
        d = asdict(self)
        d["data"] = json.dumps(d["data"])
        if d["raw_data"]:
            d["raw_data"] = json.dumps(d["raw_data"])
        d["event_date"] = str(d["event_date"]) if d["event_date"] else None
        return d


class BaseOSINTAdapter(ABC):
    """
    Base class for all Everest OSINT adapters.
    Follows SpiderFoot's sfp_template.py module pattern.

    Subclasses must implement:
        - meta (dict): Module metadata
        - watched_events(): What events trigger this adapter
        - produced_events(): What event types this adapter generates
        - fetch(): Core data retrieval
        - normalize(): Raw data → OSINTEvent conversion
    """

    meta = {
        'name': '',
        'summary': '',
        'tier': 1,            # 1=Owned, 2=Courts, 3=Spatial, 4=Market, 5=Enrichment
        'refresh': 'daily',   # daily|weekly|monthly|quarterly|annual|realtime
        'free': True,
        'counties': 67,
    }

    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self._events: List[OSINTEvent] = []

    @property
    def adapter_id(self) -> str:
        """Unique adapter identifier derived from class name."""
        name = self.__class__.__name__
        # AdapterRealAuction → realauction
        return name.replace('Adapter', '').lower()

    # --- SpiderFoot pattern: publisher/subscriber ---

    def watched_events(self) -> List[str]:
        """Events that trigger this adapter to run (subscriber)."""
        return []

    @abstractmethod
    def produced_events(self) -> List[str]:
        """Event types this adapter generates (publisher)."""
        ...

    # --- Core methods ---

    @abstractmethod
    async def fetch(self, county: str = None, since: str = None) -> List[Dict]:
        """
        Fetch raw data from source.

        Args:
            county: Filter by FL county (None = all)
            since: ISO date string, fetch only data after this date

        Returns:
            List of raw data dicts from source
        """
        ...

    @abstractmethod
    def normalize(self, raw_data: Dict) -> OSINTEvent:
        """
        Normalize a single raw source record to an OSINTEvent.

        Args:
            raw_data: One record from fetch() output

        Returns:
            OSINTEvent with standardized fields
        """
        ...

    def score(self, event: OSINTEvent) -> int:
        """
        Score event confidence 0-100. Override for source-specific scoring.
        Default: 50 (neutral confidence).
        """
        return 50

    # --- Pipeline methods ---

    async def run(self, county: str = None, since: str = None) -> List[OSINTEvent]:
        """
        Full pipeline: fetch → normalize → score → dedup.

        Args:
            county: Filter by FL county
            since: Fetch data after this date

        Returns:
            List of deduplicated, scored OSINTEvents
        """
        raw_records = await self.fetch(county=county, since=since)

        events = []
        seen_hashes = set()

        for raw in raw_records:
            try:
                event = self.normalize(raw)
                event.confidence = self.score(event)
                event.source_adapter = self.adapter_id

                # Dedup within batch
                if event.dedup_hash not in seen_hashes:
                    seen_hashes.add(event.dedup_hash)
                    events.append(event)
            except Exception as e:
                # Log but don't fail the batch
                print(f"[{self.adapter_id}] normalize error: {e}")
                continue

        self._events = events
        return events

    def get_supabase_rows(self) -> List[Dict]:
        """Convert all events to Supabase-ready dicts."""
        return [e.to_dict() for e in self._events]
