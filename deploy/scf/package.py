"""Build an upload ZIP for Tencent Cloud SCF Web Function (Node.js 20.19)."""

import argparse
from pathlib import Path
import subprocess
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


here = Path(__file__).resolve().parent
root = here.parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("output", type=Path, help="Destination ZIP file")
output = parser.parse_args().output.resolve()
subprocess.run(["node", "build.mjs"], cwd=root, check=True)

files = {
    "scf_bootstrap": (here / "scf_bootstrap", 0o755),
    "server.mjs": (here / "server.mjs", 0o644),
    "worker.mjs": (root / "dist" / "server" / "index.js", 0o644),
}
output.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(output, "w", compression=ZIP_DEFLATED) as archive:
    for name, (source, permissions) in files.items():
        info = ZipInfo(name)
        info.create_system = 3
        info.external_attr = (0o100000 | permissions) << 16
        content = source.read_bytes().replace(b"\r\n", b"\n")
        archive.writestr(info, content, compress_type=ZIP_DEFLATED)

print(output)
