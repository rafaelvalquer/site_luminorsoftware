"""Compatibilidade: execute as verificações de navegador em Node/Playwright."""
from pathlib import Path
import subprocess
subprocess.run(['node', str(Path(__file__).with_suffix('.cjs'))], check=True)
