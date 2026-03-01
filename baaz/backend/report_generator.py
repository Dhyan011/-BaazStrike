"""
report_generator.py — Builds ScanReport and ScanSummary from raw AttackResult data.
"""
import json
from models import AttackResult, ScanSummary, ScanReport


SEVERITY_WEIGHTS = {
    "CRITICAL": 30,
    "HIGH": 15,
    "MEDIUM": 7,
    "LOW": 3,
    "NONE": 0,
}


def compute_risk_score(vulnerabilities: list[AttackResult]) -> int:
    """Compute 0-100 risk score based on severity of found vulnerabilities."""
    raw = sum(SEVERITY_WEIGHTS.get(v.severity, 0) for v in vulnerabilities)
    return min(100, raw)


def build_summary(vulnerabilities: list[AttackResult], total_probes: int) -> ScanSummary:
    successes = [v for v in vulnerabilities if v.success]
    counts = {s: 0 for s in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]}
    for v in successes:
        if v.severity in counts:
            counts[v.severity] += 1
    return ScanSummary(
        total_vulnerabilities=len(successes),
        critical=counts["CRITICAL"],
        high=counts["HIGH"],
        medium=counts["MEDIUM"],
        low=counts["LOW"],
        risk_score=compute_risk_score(successes),
        total_probes=total_probes,
    )


def build_report(
    scan_id: str,
    endpoint: str,
    status: str,
    vulnerabilities: list[AttackResult],
    total_probes: int,
    created_at: str,
) -> ScanReport:
    summary = build_summary(vulnerabilities, total_probes)
    return ScanReport(
        scan_id=scan_id,
        endpoint=endpoint,
        status=status,
        summary=summary,
        vulnerabilities=[v for v in vulnerabilities if v.success],
        created_at=created_at,
    )


def deserialize_vulnerabilities(raw_json: str) -> list[AttackResult]:
    """Convert JSON string from DB back to list of AttackResult."""
    try:
        items = json.loads(raw_json)
        return [AttackResult(**item) for item in items]
    except Exception:
        return []
