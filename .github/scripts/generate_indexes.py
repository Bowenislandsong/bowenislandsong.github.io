import os
import json

def generate_index(root, ext, out_path):
    files = []
    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            if f.lower().endswith(ext):
                path = os.path.join(dirpath, f).replace("\\", "/")
                files.append({"name": f, "path": path})
    with open(out_path, "w") as out:
        json.dump(files, out, indent=2)

if __name__ == "__main__":
    generate_index("classes", ".pdf", "classes/index.json")
    generate_index("papers", ".md", "papers/index.json")
