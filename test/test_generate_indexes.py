import os
import json

def generate_index(dir_path, ext):
    files = []
    for root, _, fs in os.walk(dir_path):
        for f in fs:
            if f.lower().endswith(ext):
                path = os.path.join(root, f).replace('\\', '/')
                files.append({'name': f, 'path': path})
    return files

def main():
    classes_index = generate_index('classes', '.pdf')
    with open('classes/index.json', 'w') as out:
        json.dump(classes_index, out, indent=2)
    print(f"Generated classes/index.json with {len(classes_index)} PDFs.")

    papers_index = generate_index('papers', '.md')
    with open('papers/index.json', 'w') as out:
        json.dump(papers_index, out, indent=2)
    print(f"Generated papers/index.json with {len(papers_index)} markdown files.")

if __name__ == '__main__':
    main()
