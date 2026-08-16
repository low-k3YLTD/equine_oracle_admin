# Equine Oracle Admin — Corporate Integration Contract

**Owner:** Lowkey Consultants Limited  
**Classification:** Proprietary — Director's Eyes Only  
**System role:** Administrative and operational control surface for Equine Oracle v3.1

## Role in the corporate portfolio

This repository provides the administrative dashboard, prediction monitoring, analytics, and operational controls for the Equine Oracle product. The production prediction and market-intelligence source of truth is maintained in `silencemerchant/oracle_engine_web`; this repository should consume its typed outputs rather than maintain a second, divergent probability implementation.

## Supported report shape

The admin application should treat positive-edge output as analytical data with explicit provenance. The minimum runner contract is:

| Field | Meaning |
|---|---|
| `horseId` | Stable runner identifier |
| `horseName` | Display name |
| `decimalOdds` | Decimal price used for the calculation |
| `modelProbability` | Model estimate, normalized to a fraction from 0 to 1 |
| `marketProbability` | Shin-style normalized market probability |
| `probabilityEdge` | Model probability minus market probability |
| `expectedValue` | `(modelProbability * decimalOdds) - 1` |
| `fractionalKellyFraction` | Conservative bankroll fraction after the configured Kelly multiplier and cap |
| `positiveEdge` | Boolean threshold result |
| `recommendation` | `positive_edge`, `watch`, or `avoid` |

The admin UI should display the timestamp, data source, market overround, and any fallback status next to the values. It should not present a positive edge as a guaranteed result or as individualized financial advice.

## Security boundary

Credentials for The Racing API must never be stored in this repository, the frontend bundle, or source comments. The service layer must receive `RACING_API_USERNAME`, `RACING_API_PASSWORD`, and `RACING_API_BASE_URL` through an encrypted deployment environment. Any credential previously shared in development material should be rotated before production use.

## Corporate alignment

The June 2026 corporate report positions Equine Oracle v3.1 as a production-ready predictive analytics product with SaaS subscriptions and proprietary-trading applications. The admin surface supports that position by exposing model monitoring, data freshness, edge provenance, and operational controls in a reviewable format. It should retain audit-friendly logs for report generation, cache invalidation, and manual force-sync actions.

## Hermes boundary

Hermes integration belongs behind an authenticated report endpoint. The admin surface may expose a narrow operation for requesting a daily report, but it must not forward raw credentials or permit arbitrary code execution. Every automated report request should be attributable to a user, schedule, or service identity.

## Release checks

Changes that modify prediction or edge fields should include a test fixture and pass the repository's type-check and test commands before release. Deployment should be performed from a reviewable Git commit and should use the same environment-variable names as the production Oracle Engine service.

## References

1. Lowkey Consultants Limited, *Corporate Records & Strategic Documentation*, June 2026, supplied as a proprietary project attachment.
2. `silencemerchant/oracle_engine_web/CORPORATE_ALIGNMENT.md`.
3. The Racing API, [official documentation](https://www.theracingapi.com/docs/).
