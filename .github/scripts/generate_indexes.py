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

def generate_classes_index():
    """Generate classes index with both PDF and markdown files"""
    files = []
    for dirpath, _, filenames in os.walk("classes"):
        for f in filenames:
            if f.lower().endswith(('.pdf', '.md', '.asm')):
                path = os.path.join(dirpath, f).replace("\\", "/")
                file_type = "pdf" if f.lower().endswith('.pdf') else "markdown" if f.lower().endswith('.md') else "asm"
                files.append({"name": f, "path": path, "type": file_type})
    with open("classes/index.json", "w") as out:
        json.dump(files, out, indent=2)

if __name__ == "__main__":
    generate_classes_index()
    generate_index("papers", ".md", "papers/index.json")
