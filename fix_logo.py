import os
import re

# Replace any existing nav-logo src (external or missing) with local logo
regex = re.compile(
    r'<img src="[^"]*" alt="RRDCH Logo" class="nav-logo">',
)
replacement = '<img src="images/logo.png" alt="RRDCH Logo" class="nav-logo">'

for file in os.listdir('.'):
    if file.endswith('.html'):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = regex.sub(replacement, content)
        if new_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated logo src in {file}')
        else:
            print(f'No logo img found in {file}')
