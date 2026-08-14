# Swiss Ephemeris data provenance

The runtime files `sepl_18.se1`, `semo_18.se1`, and `seas_18.se1` were copied
from the repository's reviewed `natal_chart/ephe` dataset for the browser
integration. Their original upstream download timestamp and release version
were not recorded, so no more specific provenance is claimed here.

The filenames follow the standard Swiss Ephemeris data-file convention. The
SHA-256 digests in `CHECKSUMS.sha256` are the authoritative identity record for
the exact files shipped by this application. Any asset replacement must update
the provenance and checksum record together and pass the real-asset browser
smoke test.
