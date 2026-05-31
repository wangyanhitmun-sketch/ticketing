#!/usr/bin/env python3
from pathlib import Path
import yaml

files = [
    Path('architecture/openapi/P0-openapi.yaml'),
    Path('packages/contracts/openapi.yaml'),
]

for file in files:
    with file.open('r', encoding='utf-8') as handle:
        data = yaml.safe_load(handle)
    print(f'{file}: yaml ok ({data.get("openapi", "unknown")})')
