from pathlib import Path
import zipfile,shutil,hashlib
root=Path(__file__).resolve().parents[1]
shutil.copy2(root/'engine/core.mjs',root/'public/core.mjs')
target=root/'public/downloads/sift-api.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as archive:
 for file in sorted((root/'engine').iterdir()):
  if file.is_file():archive.write(file,arcname='sift-api/'+file.name)
(root/'public/downloads/SHA256SUMS.txt').write_text(hashlib.sha256(target.read_bytes()).hexdigest()+'  '+target.name+'\n')
