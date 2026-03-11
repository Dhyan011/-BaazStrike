"""
models.py — Pydantic data models for Baaz.
"""
from pydantic import BaseModel, Field
from typing import Literal, List, Any


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
    educational_content: str = ""
    resources: List[Any] = Field(default_factory=list)


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
