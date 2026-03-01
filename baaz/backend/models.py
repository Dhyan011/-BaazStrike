"""
models.py — Pydantic data models for Baaz.
"""
from pydantic import BaseModel
from typing import Literal, List


class ScanRequest(BaseModel):
    endpoint: str


class AttackResult(BaseModel):
    attack_type: str
    payload: str
    response: str
    success: bool
    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"]
    exposed: str
    explanation: str
    fix: str


class ScanSummary(BaseModel):
    total_vulnerabilities: int
    critical: int
    high: int
    medium: int
    low: int
    risk_score: int  # 0-100
    total_probes: int


class ScanReport(BaseModel):
    scan_id: str
    endpoint: str
    status: str
    summary: ScanSummary
    vulnerabilities: List[AttackResult]
    created_at: str
