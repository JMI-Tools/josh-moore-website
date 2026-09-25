import concurrent.futures,hashlib,json,pathlib,urllib.request
assets=json.loads(pathlib.Path(".media-kit-assets.json").read_text())
def restore(a):
 p=a["path"]
 assert p.startswith("client/public/media-kit/")
 data=urllib.request.urlopen("https://www.itsjoshmoore.com/"+p.removeprefix("client/public/"),timeout=60).read()
 actual=hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()
 assert actual==a["sha"],p+" hash mismatch"
 dest=pathlib.Path(p);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(restore,assets))
print("Verified and restored",len(assets),"published assets")
