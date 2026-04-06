"""Tests for base adapter pattern."""
from adapters.base import BaseOSINTAdapter, OSINTEvent

def test_osint_event_dedup_hash():
    """Same data produces same hash."""
    e1 = OSINTEvent(event_type="TEST", county="BREVARD", data={"val": 1}, source_adapter="test")
    e2 = OSINTEvent(event_type="TEST", county="BREVARD", data={"val": 1}, source_adapter="test")
    assert e1.dedup_hash == e2.dedup_hash

def test_osint_event_different_hash():
    """Different data produces different hash."""
    e1 = OSINTEvent(event_type="TEST", county="BREVARD", data={"val": 1}, source_adapter="test")
    e2 = OSINTEvent(event_type="TEST", county="BREVARD", data={"val": 2}, source_adapter="test")
    assert e1.dedup_hash != e2.dedup_hash

def test_osint_event_to_dict():
    """to_dict produces Supabase-ready format."""
    e = OSINTEvent(event_type="AUCTION_LISTING", county="BREVARD", data={"price": 100000}, source_adapter="test", pin="12345")
    d = e.to_dict()
    assert isinstance(d["data"], str)  # JSON string
    assert d["pin"] == "12345"
    assert d["confidence"] == 50
