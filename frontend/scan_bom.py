import os

def check_bom(path):
    try:
        with open(path, 'rb') as f:
            content = f.read(3)
        if content == b'\xef\xbb\xbf':
            print(f"BOM found in {path}")
            # Remove BOM
            with open(path, 'rb') as f:
                full_content = f.read()
            with open(path, 'wb') as f:
                f.write(full_content[3:])
            print(f"Fixed {path}")
            return True
    except Exception as e:
        pass
    return False

cwd = os.getcwd()
print(f"Scanning {cwd} for BOM...")
for root, dirs, files in os.walk(cwd):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.git' in dirs:
        dirs.remove('.git')
        
    for file in files:
        if file.endswith(('.json', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.md')):
            check_bom(os.path.join(root, file))
print("Scan complete.")
